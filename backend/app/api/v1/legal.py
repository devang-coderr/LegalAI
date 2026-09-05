"""
Legal research route -- POST /api/v1/legal/research, the second of the
frontend's three live-wired endpoints (services/legalResearch.api.ts ->
useLegalResearch hook).
"""
from fastapi import APIRouter

from app.schemas.common import Envelope
from app.schemas.legal import LegalResearchRequest, LegalResearchResult
from app.services import legal_research_service

router = APIRouter(prefix="/legal", tags=["legal-research"])


@router.post("/research", response_model=Envelope[LegalResearchResult])
async def research(payload: LegalResearchRequest):
    result = await legal_research_service.research(payload.query, payload.court, payload.source_type)
    return Envelope(success=True, data=result)
