"""
Case + Case Intelligence schemas.
"""
from datetime import datetime

from app.schemas.base import CamelModel


# ---- nested pieces of CaseIntelligenceResult ----

class KeyEvent(CamelModel):
    date: str | None = None
    event: str


class Parties(CamelModel):
    plaintiff: str
    defendant: str


class CaseFacts(CamelModel):
    overview: str
    key_events: list[KeyEvent]
    parties: Parties


class LegalIssue(CamelModel):
    id: str
    title: str
    description: str
    severity: str  # "HIGH" | "MEDIUM" | "LOW"


class ApplicableLaw(CamelModel):
    act_name: str
    section: str
    title: str
    explanation: str


class Precedent(CamelModel):
    id: str
    case_name: str
    citation: str
    court: str
    year: int
    relevance_score: float
    summary: str
    why_relevant: str


class CaseIntelligenceResult(CamelModel):
    case_id: str | None = None
    summary: str
    facts: CaseFacts
    issues: list[LegalIssue]
    applicable_laws: list[ApplicableLaw]
    precedents: list[Precedent]
    recommended_steps: list[str]
    disclaimer: str


# ---- request/response wrappers ----

class CaseIntelligenceRequest(CamelModel):
    query: str
    case_id: str | None = None


class CaseCreateRequest(CamelModel):
    title: str
    case_number: str | None = None
    court: str = "District Court"
    bench: str | None = None
    client_id: str | None = None
    client_name: str = ""
    case_type: str | None = None
    priority: str | None = "MEDIUM"
    assigned_lawyer: str | None = None
    description: str | None = None
    status: str = "ACTIVE"
    statutory_acts: str = "General Law"
    next_hearing_date: str | None = None


class CaseUpdateRequest(CamelModel):
    title: str | None = None
    case_number: str | None = None
    court: str | None = None
    bench: str | None = None
    client_id: str | None = None
    client_name: str | None = None
    case_type: str | None = None
    priority: str | None = None
    assigned_lawyer: str | None = None
    description: str | None = None
    status: str | None = None
    statutory_acts: str | None = None
    next_hearing_date: str | None = None


class CaseResponse(CamelModel):
    """Matches the frontend's `Case` type (types/case.ts) for list/detail views."""
    id: str
    title: str
    case_number: str | None = None
    court: str
    bench: str | None = None
    client_id: str | None = None
    client_name: str
    case_type: str | None = None
    priority: str | None = None
    assigned_lawyer: str | None = None
    description: str | None = None
    status: str
    statutory_acts: str
    next_hearing_date: str | None = None
    intelligence: CaseIntelligenceResult | None = None
    owner_lawyer_id: str | None = None
    created_at: datetime
