import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lawyer_profile import LawyerProfile
from app.models.user import User, UserRole, VerificationStatus
from app.repositories import user_repository, lawyer_repository
from app.schemas.common import AppError
from app.schemas.user import RegisterRequest, ProfileUpdateRequest, PasswordChangeRequest
from app.security.jwt import create_access_token
from app.security.password import hash_password, verify_password


async def register(db: AsyncSession, payload: RegisterRequest) -> tuple[User, str]:
    existing = await user_repository.get_by_email(db, payload.email)
    if existing:
        raise AppError("EMAIL_ALREADY_EXISTS", "An account with this email already exists.", status_code=409)

    role = UserRole(payload.role)
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=role,
        phone=payload.phone,
        bar_number=payload.bar_number if role == UserRole.LAWYER else None,
        bar_council=payload.bar_council if role == UserRole.LAWYER else None,
        court_admission=payload.court_admission or payload.court if role == UserRole.LAWYER else None,
        verification_status=VerificationStatus.PENDING if role == UserRole.LAWYER else None,
    )
    user = await user_repository.create(db, user)

    if role == UserRole.LAWYER:
        profile = LawyerProfile(
            id=str(uuid.uuid4()),
            user_id=user.id,
            court=payload.court or payload.court_admission,
            location=payload.location,
            practice_areas=payload.practice_areas or [],
            languages=payload.languages or [],
            experience_years=payload.experience_years,
            is_available=True,
        )
        await lawyer_repository.create_or_update(db, profile)

    token = create_access_token(user.id, user.role.value)
    return user, token


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, str]:
    user = await user_repository.get_by_email(db, email)

    if not user or not verify_password(password, user.password_hash):
        raise AppError("INVALID_CREDENTIALS", "Incorrect email or password.", status_code=401)

    if not user.is_active:
        raise AppError("ACCOUNT_DISABLED", "This account has been disabled.", status_code=403)

    token = create_access_token(user.id, user.role.value)
    return user, token


async def update_profile(db: AsyncSession, user: User, payload: ProfileUpdateRequest) -> User:
    if payload.name is not None:
        user.name = payload.name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url
    if payload.bar_number is not None:
        user.bar_number = payload.bar_number
    if payload.bar_council is not None:
        user.bar_council = payload.bar_council
    if payload.court_admission is not None:
        user.court_admission = payload.court_admission
    elif payload.court is not None:
        user.court_admission = payload.court

    user = await user_repository.update(db, user)

    if user.role == UserRole.LAWYER:
        profile = await lawyer_repository.get_or_create_by_user_id(db, user.id)
        if payload.court is not None:
            profile.court = payload.court
        if payload.location is not None:
            profile.location = payload.location
        if payload.practice_areas is not None:
            profile.practice_areas = payload.practice_areas
        if payload.languages is not None:
            profile.languages = payload.languages
        if payload.experience_years is not None:
            profile.experience_years = payload.experience_years
        await lawyer_repository.create_or_update(db, profile)

    return user


async def change_password(db: AsyncSession, user: User, payload: PasswordChangeRequest) -> None:
    if not verify_password(payload.current_password, user.password_hash):
        raise AppError("INVALID_PASSWORD", "Current password does not match.", status_code=400)

    user.password_hash = hash_password(payload.new_password)
    await user_repository.update(db, user)


async def update_verification_status(db: AsyncSession, user: User, status: str) -> User:
    user.verification_status = VerificationStatus(status)
    return await user_repository.update(db, user)
