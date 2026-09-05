"""
Notification model for Citizen and Lawyer workspaces.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class NotificationCategory(str, enum.Enum):
    REQUEST = "request"
    HEARING = "hearing"
    CASE = "case"
    DOCUMENT = "document"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[NotificationCategory] = mapped_column(
        SAEnum(NotificationCategory, values_callable=lambda obj: [e.value for e in obj]), default=NotificationCategory.SYSTEM, nullable=False
    )
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
