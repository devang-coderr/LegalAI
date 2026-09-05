"""
Hearing model for Lawyer workspace and Case management.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Text, JSON, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class HearingStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    ADJOURNED = "ADJOURNED"
    CANCELLED = "CANCELLED"


class HearingReminder(str, enum.Enum):
    NONE = "NONE"
    ONE_DAY = "1_DAY"
    THREE_DAYS = "3_DAYS"
    ONE_WEEK = "1_WEEK"


class Hearing(Base):
    __tablename__ = "hearings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    lawyer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    client_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)

    case_title: Mapped[str] = mapped_column(String(500), nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    court: Mapped[str] = mapped_column(String(255), nullable=False)

    date: Mapped[str] = mapped_column(String(20), nullable=False)  # yyyy-mm-dd
    time: Mapped[str] = mapped_column(String(20), default="10:30", nullable=False)  # HH:mm
    hearing_type: Mapped[str] = mapped_column(String(100), default="Preliminary Hearing", nullable=False)
    status: Mapped[HearingStatus] = mapped_column(SAEnum(HearingStatus), default=HearingStatus.SCHEDULED, nullable=False, index=True)

    prep_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reminder: Mapped[HearingReminder] = mapped_column(SAEnum(HearingReminder), default=HearingReminder.ONE_DAY, nullable=False)
    outcome: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_hearing_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )