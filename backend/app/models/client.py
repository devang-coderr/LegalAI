"""
Client model for Lawyer workspace.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ClientSource(str, enum.Enum):
    MANUAL = "MANUAL"
    CLIENT_REQUEST = "CLIENT_REQUEST"


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lawyer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source: Mapped[ClientSource] = mapped_column(SAEnum(ClientSource), default=ClientSource.MANUAL, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
