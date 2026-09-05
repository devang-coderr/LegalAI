"""
Client Request repository.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client_request import ClientRequest, RequestStatus


async def create(db: AsyncSession, req: ClientRequest) -> ClientRequest:
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return req


async def get_by_id(db: AsyncSession, request_id: str) -> ClientRequest | None:
    result = await db.execute(select(ClientRequest).where(ClientRequest.id == request_id))
    return result.scalar_one_or_none()


async def list_for_lawyer(db: AsyncSession, lawyer_id: str) -> list[ClientRequest]:
    result = await db.execute(
        select(ClientRequest).where(ClientRequest.lawyer_id == lawyer_id).order_by(ClientRequest.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_citizen(db: AsyncSession, citizen_id: str) -> list[ClientRequest]:
    result = await db.execute(
        select(ClientRequest).where(ClientRequest.citizen_id == citizen_id).order_by(ClientRequest.created_at.desc())
    )
    return list(result.scalars().all())


async def find_active_pending(
    db: AsyncSession, citizen_id: str, lawyer_id: str, summary: str
) -> ClientRequest | None:
    result = await db.execute(
        select(ClientRequest).where(
            ClientRequest.citizen_id == citizen_id,
            ClientRequest.lawyer_id == lawyer_id,
            ClientRequest.summary == summary,
            ClientRequest.status == RequestStatus.PENDING,
        )
    )
    return result.scalar_one_or_none()


async def update(db: AsyncSession, req: ClientRequest) -> ClientRequest:
    await db.commit()
    await db.refresh(req)
    return req
