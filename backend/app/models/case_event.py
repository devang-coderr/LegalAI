"""
Case timeline events.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class TimelineStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    UPCOMING = "UPCOMING"
    PENDING = "PENDING"


class EventType(str, enum.Enum):
    FILED = "FILED"
    NOTICE = "NOTICE"
    REPLY = "REPLY"
    HEARING = "HEARING"
    ORDER = "ORDER"
    OTHER = "OTHER"


class CaseEvent(Base):
    __tablename__ = "case_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_date: Mapped[str] = mapped_column(String(50), nullable=False)  # ISO string or human date e.g. "10 June 2026"
    event_type: Mapped[EventType] = mapped_column(SAEnum(EventType), default=EventType.OTHER, nullable=False)
    status: Mapped[TimelineStatus] = mapped_column(SAEnum(TimelineStatus), default=TimelineStatus.COMPLETED, nullable=False)

    linked_document_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_by_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)