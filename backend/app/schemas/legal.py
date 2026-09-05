"""
Legal Research schemas -- field-for-field match against src/types/legal.ts,
confirmed during Phase 0. `LegalIssue`, `ApplicableLaw`, `Precedent` are
shared with case.py (same types on the frontend side too) -- imported,
not redefined, so the two endpoints can't silently drift apart.
"""
from app.schemas.base import CamelModel
from app.schemas.case import ApplicableLaw, LegalIssue, Precedent


class Citation(CamelModel):
    id: str
    title: str
    citation_number: str
    court: str
    judgment_date: str
    excerpt: str
    source_url: str | None = None
    ratio_decidendi: str
    category: str | None = None
    source_type: str | None = None


class LegalResearchRequest(CamelModel):
    query: str
    court: str = "ALL"
    source_type: str | None = None


class LegalResearchResult(CamelModel):
    query: str
    ai_explanation: str
    legal_issues: list[LegalIssue]
    applicable_laws: list[ApplicableLaw]
    citations: list[Citation]
    precedents: list[Precedent]
