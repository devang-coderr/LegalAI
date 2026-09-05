"""
User model -- Citizens and Lawyers share one table, differentiated by `role`.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    LAWYER = "LAWYER"
    ADMIN = "ADMIN"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"
    __allow_unmapped__ = True

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Lawyer-specific fields
    bar_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bar_council: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_status: Mapped[VerificationStatus | None] = mapped_column(
        SAEnum(VerificationStatus), nullable=True, default=None
    )

    avatar_url: str | None = None
    court_admission: str | None = None

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
