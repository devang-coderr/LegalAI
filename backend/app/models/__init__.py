"""
SQLAlchemy models initialization.
"""
from app.models.user import User, UserRole, VerificationStatus
from app.models.case import Case, CaseStatus, CasePriority
from app.models.client import Client, ClientSource
from app.models.document import Document, DocumentCategory, LawyerDocumentType, DocumentProcessingStatus
from app.models.document_qa import DocumentQA
from app.models.hearing import Hearing, HearingStatus, HearingReminder
from app.models.research_note import ResearchNote
from app.models.client_request import ClientRequest, RequestStatus
from app.models.notification import Notification, NotificationCategory
from app.models.case_event import CaseEvent, EventType, TimelineStatus
from app.models.lawyer_profile import LawyerProfile
from app.models.escalation import Escalation, EscalationStatus

__all__ = [
    "User",
    "UserRole",
    "VerificationStatus",
    "Case",
    "CaseStatus",
    "CasePriority",
    "Client",
    "ClientSource",
    "Document",
    "DocumentCategory",
    "LawyerDocumentType",
    "DocumentProcessingStatus",
    "DocumentQA",
    "Hearing",
    "HearingStatus",
    "HearingReminder",
    "ResearchNote",
    "ClientRequest",
    "RequestStatus",
    "Notification",
    "NotificationCategory",
    "CaseEvent",
    "EventType",
    "TimelineStatus",
    "LawyerProfile",
    "Escalation",
    "EscalationStatus",
]
