"""
Client repository for Lawyer workspace.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client


async def create(db: AsyncSession, client: Client) -> Client:
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


async def get_by_id(db: AsyncSession, client_id: str) -> Client | None:
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def list_for_lawyer(db: AsyncSession, lawyer_id: str) -> list[Client]:
    result = await db.execute(
        select(Client).where(Client.lawyer_id == lawyer_id).order_by(Client.created_at.desc())
    )
    return list(result.scalars().all())


async def update(db: AsyncSession, client: Client) -> Client:
    await db.commit()
    await db.refresh(client)
    return client


async def delete(db: AsyncSession, client: Client) -> None:
    await db.delete(client)
    await db.commit()
