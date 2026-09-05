"""
Research Note repository for Lawyer client profiles.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.research_note import ResearchNote


async def create(db: AsyncSession, note: ResearchNote) -> ResearchNote:
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


async def get_by_id(db: AsyncSession, note_id: str) -> ResearchNote | None:
    result = await db.execute(select(ResearchNote).where(ResearchNote.id == note_id))
    return result.scalar_one_or_none()


async def list_for_client(db: AsyncSession, client_id: str, lawyer_id: str) -> list[ResearchNote]:
    result = await db.execute(
        select(ResearchNote).where(ResearchNote.client_id == client_id, ResearchNote.lawyer_id == lawyer_id).order_by(ResearchNote.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_lawyer(db: AsyncSession, lawyer_id: str) -> list[ResearchNote]:
    result = await db.execute(
        select(ResearchNote).where(ResearchNote.lawyer_id == lawyer_id).order_by(ResearchNote.created_at.desc())
    )
    return list(result.scalars().all())


async def update(db: AsyncSession, note: ResearchNote) -> ResearchNote:
    await db.commit()
    await db.refresh(note)
    return note


async def delete(db: AsyncSession, note: ResearchNote) -> None:
    await db.delete(note)
    await db.commit()
