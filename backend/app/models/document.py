"""
Document model for Citizen and Lawyer document repositories.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, Text, JSON, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DocumentCategory(str, enum.Enum):
    NOTICE = "Notice"
    AGREEMENT = "Agreement"
    COURT_ORDER = "Court Order"
    PROPERTY_DOCUMENT = "Property Document"
    ID_OTHER = "ID / Other"
    UNCATEGORIZED = "Uncategorized"


class LawyerDocumentType(str, enum.Enum):
    PLEADING = "Pleading"
    EVIDENCE = "Evidence"
    CORRESPONDENCE = "Correspondence"
    COURT_ORDER = "Court Order"
    AGREEMENT = "Agreement"
    OTHER = "Other"


class DocumentProcessingStatus(str, enum.Enum):
    UPLOADING = "uploading"
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    lawyer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    client_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    case_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="Uncategorized", nullable=False)
    document_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    status: Mapped[DocumentProcessingStatus] = mapped_column(
        SAEnum(DocumentProcessingStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=DocumentProcessingStatus.READY,
        nullable=False,
    )
    error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
