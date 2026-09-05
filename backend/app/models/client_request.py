"""
Client Consultation Request model (Citizen -> Lawyer connection).
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    CANCELLED = "CANCELLED"



class ClientRequest(Base):
    __tablename__ = "client_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lawyer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    citizen_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    case_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    status: Mapped[RequestStatus] = mapped_column(SAEnum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
