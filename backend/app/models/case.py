"""
Case model for Citizen and Lawyer workspaces.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Text, JSON, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class CaseStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    SETTLED = "SETTLED"
    CLOSED = "CLOSED"
    UPCOMING_HEARING = "UPCOMING_HEARING"


class CasePriority(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    owner_lawyer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    case_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    court: Mapped[str] = mapped_column(String(255), default="District Court", nullable=False)
    bench: Mapped[str | None] = mapped_column(String(255), nullable=True)

    client_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    client_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    case_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    priority: Mapped[CasePriority | None] = mapped_column(SAEnum(CasePriority), default=CasePriority.MEDIUM, nullable=True)
    assigned_lawyer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[CaseStatus] = mapped_column(SAEnum(CaseStatus), default=CaseStatus.ACTIVE, nullable=False, index=True)
    statutory_acts: Mapped[str] = mapped_column(String(500), default="General Law", nullable=False)
    next_hearing_date: Mapped[str | None] = mapped_column(String(100), nullable=True)

    query_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    intelligence_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
