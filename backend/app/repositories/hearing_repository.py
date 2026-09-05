"""
Hearing repository for Lawyer and Case hearings.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hearing import Hearing


async def create(db: AsyncSession, hearing: Hearing) -> Hearing:
    db.add(hearing)
    await db.commit()
    await db.refresh(hearing)
    return hearing


async def get_by_id(db: AsyncSession, hearing_id: str) -> Hearing | None:
    result = await db.execute(select(Hearing).where(Hearing.id == hearing_id))
    return result.scalar_one_or_none()


async def list_for_lawyer(db: AsyncSession, lawyer_id: str) -> list[Hearing]:
    result = await db.execute(
        select(Hearing).where(Hearing.lawyer_id == lawyer_id).order_by(Hearing.date.asc(), Hearing.time.asc())
    )
    return list(result.scalars().all())


async def list_for_case(db: AsyncSession, case_id: str) -> list[Hearing]:
    result = await db.execute(
        select(Hearing).where(Hearing.case_id == case_id).order_by(Hearing.date.asc(), Hearing.time.asc())
    )
    return list(result.scalars().all())


async def list_for_client(db: AsyncSession, client_id: str) -> list[Hearing]:
    result = await db.execute(
        select(Hearing).where(Hearing.client_id == client_id).order_by(Hearing.date.asc(), Hearing.time.asc())
    )
    return list(result.scalars().all())


async def update(db: AsyncSession, hearing: Hearing) -> Hearing:
    await db.commit()
    await db.refresh(hearing)
    return hearing


async def delete(db: AsyncSession, hearing: Hearing) -> None:
    await db.delete(hearing)
    await db.commit()