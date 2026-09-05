"""
Citizen -> Lawyer escalation.

Simplified from the full Phase-0 design for this P1 slice: shares the
whole case (not individual documents -- there's no persisted `documents`
table yet, since P0's OCR endpoint is deliberately stateless). A real
`escalation_documents` join table is the natural extension once document
persistence exists.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class EscalationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class Escalation(Base):
    __tablename__ = "escalations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    citizen_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    lawyer_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[EscalationStatus] = mapped_column(
        SAEnum(EscalationStatus), default=EscalationStatus.PENDING, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)