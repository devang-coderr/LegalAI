"""
Lawyer profile repository.
"""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lawyer_profile import LawyerProfile
from app.models.user import User, UserRole


async def get_by_user_id(db: AsyncSession, user_id: str) -> LawyerProfile | None:
    result = await db.execute(select(LawyerProfile).where(LawyerProfile.user_id == user_id))
    return result.scalar_one_or_none()


async def get_or_create_by_user_id(db: AsyncSession, user_id: str) -> LawyerProfile:
    profile = await get_by_user_id(db, user_id)
    if profile is None:
        profile = LawyerProfile(
            id=str(uuid.uuid4()),
            user_id=user_id,
            court=None,
            location=None,
            practice_areas=[],
            languages=[],
            experience_years=None,
            is_available=True,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def create_or_update(db: AsyncSession, profile: LawyerProfile) -> LawyerProfile:
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def search_candidates(db: AsyncSession) -> list[tuple[LawyerProfile, User]]:
    query = (
        select(User, LawyerProfile)
        .outerjoin(LawyerProfile, User.id == LawyerProfile.user_id)
        .where(User.role == UserRole.LAWYER, User.is_active == True)
    )
    result = await db.execute(query)
    rows: list[tuple[LawyerProfile, User]] = []
    for user, profile in result.all():
        if profile is None:
            profile = await get_or_create_by_user_id(db, user.id)
        if profile.is_available:
            rows.append((profile, user))
    return rows
