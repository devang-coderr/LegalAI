"""
Notification repository.
"""
from sqlalchemy import select, update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationCategory


async def create(
    db: AsyncSession, user_id: str, title: str, text: str, category: NotificationCategory = NotificationCategory.SYSTEM
) -> Notification:
    notif = Notification(user_id=user_id, title=title, text=text, category=category)
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif


async def list_for_user(db: AsyncSession, user_id: str) -> list[Notification]:
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    )
    return list(result.scalars().all())


async def mark_all_read(db: AsyncSession, user_id: str) -> None:
    await db.execute(
        sa_update(Notification).where(Notification.user_id == user_id, Notification.read == False).values(read=True)
    )
    await db.commit()
