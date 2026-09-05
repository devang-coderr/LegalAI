"""
Document schemas for Citizen and Lawyer document repositories and OCR.
"""
from datetime import datetime
from app.schemas.base import CamelModel


class DetectedDate(CamelModel):
    label: str
    date: str


class Risk(CamelModel):
    clause: str
    risk_level: str  # "HIGH" | "MEDIUM" | "LOW"
    explanation: str
    recommendation: str


class ChecklistItem(CamelModel):
    item: str
    status: str  # "VERIFIED" | "MISSING" | "OPTIONAL"


class PartyInfo(CamelModel):
    name: str
    role: str


class DateInfo(CamelModel):
    label: str
    date: str


class ClauseInfo(CamelModel):
    title: str
    content: str


class ObligationInfo(CamelModel):
    party: str
    obligation: str


class StatutoryProvisionInfo(CamelModel):
    provision: str
    explicitly_mentioned: bool = True
    notes: str | None = None


class DocumentAnalysisResult(CamelModel):
    document_id: str
    file_name: str
    document_type: str = "Unknown"
    summary: str = ""
    parties: list[PartyInfo] = []
    dates: list[DateInfo] = []
    amounts: list[str] = []
    key_facts: list[str] = []
    important_clauses: list[ClauseInfo] = []
    obligations: list[ObligationInfo] = []
    statutory_provisions: list[StatutoryProvisionInfo] = []
    missing_info: list[str] = []
    contradictions: list[str] = []


class OCRResult(CamelModel):
    document_id: str
    file_name: str
    extracted_text: str | None = None
    summary: str | None = None
    detected_dates: list[DetectedDate] = []
    risks: list[Risk] = []
    missing_checklist: list[ChecklistItem] = []
    unavailable_reason: str | None = None
    analysis: DocumentAnalysisResult | None = None


class DocumentResponse(CamelModel):
    id: str
    file_name: str
    file_type: str
    size_bytes: int
    category: str
    document_type: str | None = None
    uploaded_at: datetime
    status: str
    object_url: str
    ocr: OCRResult | None = None
    analysis: DocumentAnalysisResult | None = None
    error_message: str | None = None
    client_id: str | None = None
    case_id: str | None = None


class DocumentAttachCaseRequest(CamelModel):
    case_id: str | None = None


class DocumentCategoryUpdateRequest(CamelModel):
    category: str


class DocumentQARequest(CamelModel):
    question: str


class DocumentQAResponse(CamelModel):
    question: str
    answer: str
    answered_at: datetime
