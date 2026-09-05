"""
Case repository for Citizen and Lawyer operations.
"""
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case import Case, CaseStatus


async def create(db: AsyncSession, case: Case) -> Case:
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return case


async def get_by_id(db: AsyncSession, case_id: str) -> Case | None:
    result = await db.execute(select(Case).where(Case.id == case_id))
    return result.scalar_one_or_none()


async def list_for_citizen(db: AsyncSession, user_id: str) -> list[Case]:
    result = await db.execute(
        select(Case).where(Case.owner_user_id == user_id).order_by(Case.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_lawyer(db: AsyncSession, lawyer_id: str) -> list[Case]:
    result = await db.execute(
        select(Case).where(or_(Case.owner_lawyer_id == lawyer_id, Case.owner_user_id == lawyer_id)).order_by(Case.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_client(db: AsyncSession, client_id: str) -> list[Case]:
    result = await db.execute(
        select(Case).where(Case.client_id == client_id).order_by(Case.created_at.desc())
    )
    return list(result.scalars().all())


async def get_lawyer_stats(db: AsyncSession, lawyer_id: str) -> dict:
    cases = await list_for_lawyer(db, lawyer_id)
    total = len(cases)
    active = sum(1 for c in cases if c.status in (CaseStatus.ACTIVE, CaseStatus.UPCOMING_HEARING))
    settled = sum(1 for c in cases if c.status == CaseStatus.SETTLED)
    closed = sum(1 for c in cases if c.status == CaseStatus.CLOSED)
    return {
        "total": total,
        "active": active,
        "settled": settled,
        "closed": closed,
    }


async def update(db: AsyncSession, case: Case) -> Case:
    await db.commit()
    await db.refresh(case)
    return case


async def delete(db: AsyncSession, case: Case) -> None:
    await db.delete(case)
    await db.commit()
