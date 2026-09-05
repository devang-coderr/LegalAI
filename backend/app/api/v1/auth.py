"""
Auth routes -- registration, login, current profile, profile updates, and password changes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories import lawyer_repository
from app.schemas.common import Envelope
from app.schemas.user import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
    ProfileUpdateRequest,
    PasswordChangeRequest,
    LawyerVerificationUpdateRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


async def _user_to_response(db: AsyncSession, user: User) -> UserResponse:
    court = user.court_admission
    location = None
    practice_areas = []
    languages = []
    experience_years = None

    if user.role == UserRole.LAWYER:
        profile = await lawyer_repository.get_by_user_id(db, user.id)
        if profile:
            court = profile.court or court
            location = profile.location
            practice_areas = profile.practice_areas or []
            languages = profile.languages or []
            experience_years = profile.experience_years

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        phone=user.phone,
        avatar_url=user.avatar_url,
        bar_number=user.bar_number,
        bar_enrolment_number=user.bar_number,
        bar_council=user.bar_council,
        court_admission=user.court_admission,
        court=court,
        location=location,
        practice_areas=practice_areas,
        languages=languages,
        experience_years=experience_years,
        verification_status=user.verification_status.value if user.verification_status else None,
        created_at=user.created_at,
    )


@router.post("/register", response_model=Envelope[AuthResponse])
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user, token = await auth_service.register(db, payload)
    user_resp = await _user_to_response(db, user)
    return Envelope(success=True, data=AuthResponse(token=token, user=user_resp))


@router.post("/login", response_model=Envelope[AuthResponse])
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    user, token = await auth_service.login(db, payload.email, payload.password)
    user_resp = await _user_to_response(db, user)
    return Envelope(success=True, data=AuthResponse(token=token, user=user_resp))


@router.get("/me", response_model=Envelope[UserResponse])
async def me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_resp = await _user_to_response(db, current_user)
    return Envelope(success=True, data=user_resp)


@router.patch("/profile", response_model=Envelope[UserResponse])
async def update_profile(
    payload: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = await auth_service.update_profile(db, current_user, payload)
    user_resp = await _user_to_response(db, updated)
    return Envelope(success=True, data=user_resp)


@router.post("/password", response_model=Envelope[dict])
async def change_password(
    payload: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await auth_service.change_password(db, current_user, payload)
    return Envelope(success=True, data={"message": "Password updated successfully."})


@router.patch("/verification", response_model=Envelope[UserResponse])
async def update_verification(
    payload: LawyerVerificationUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = await auth_service.update_verification_status(db, current_user, payload.verification_status)
    user_resp = await _user_to_response(db, updated)
    return Envelope(success=True, data=user_resp)
