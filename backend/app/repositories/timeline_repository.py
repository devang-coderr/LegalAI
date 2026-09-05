"""
Timeline repository for case event history.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case_event import CaseEvent


async def create(db: AsyncSession, event: CaseEvent) -> CaseEvent:
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def get_by_id(db: AsyncSession, event_id: str) -> CaseEvent | None:
    result = await db.execute(select(CaseEvent).where(CaseEvent.id == event_id))
    return result.scalar_one_or_none()


async def list_for_case(db: AsyncSession, case_id: str) -> list[CaseEvent]:
    result = await db.execute(
        select(CaseEvent).where(CaseEvent.case_id == case_id).order_by(CaseEvent.created_at.asc())
    )
    return list(result.scalars().all())


async def list_all(db: AsyncSession) -> list[CaseEvent]:
    result = await db.execute(select(CaseEvent).order_by(CaseEvent.created_at.asc()))
    return list(result.scalars().all())


async def update(db: AsyncSession, event: CaseEvent) -> CaseEvent:
    await db.commit()
    await db.refresh(event)
    return event


async def delete(db: AsyncSession, event: CaseEvent) -> None:
    await db.delete(event)
    await db.commit()