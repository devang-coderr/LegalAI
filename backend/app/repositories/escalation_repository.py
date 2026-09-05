"""Escalation repository."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.escalation import Escalation, EscalationStatus


async def create(db: AsyncSession, escalation: Escalation) -> Escalation:
    db.add(escalation)
    await db.commit()
    await db.refresh(escalation)
    return escalation


async def get_by_id(db: AsyncSession, escalation_id: str) -> Escalation | None:
    result = await db.execute(select(Escalation).where(Escalation.id == escalation_id))
    return result.scalar_one_or_none()


async def has_accepted_access(
    db: AsyncSession,
    case_id: str,
    lawyer_user_id: str,
) -> bool:
    """
    Return True when at least one ACCEPTED escalation exists for this
    lawyer and case.

    PENDING and REJECTED escalations do not grant access.
    Multiple ACCEPTED escalations are allowed and must not cause an error.
    """
    result = await db.execute(
        select(Escalation.id)
        .where(
            Escalation.case_id == case_id,
            Escalation.lawyer_user_id == lawyer_user_id,
            Escalation.status == EscalationStatus.ACCEPTED,
        )
        .limit(1)
    )
    return result.first() is not None


async def list_for_lawyer(db: AsyncSession, lawyer_user_id: str) -> list[Escalation]:
    result = await db.execute(
        select(Escalation).where(Escalation.lawyer_user_id == lawyer_user_id).order_by(Escalation.created_at.desc())
    )
    return list(result.scalars().all())