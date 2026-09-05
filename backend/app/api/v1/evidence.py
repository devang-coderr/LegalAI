"""
Evidence and Contradiction Analysis routes.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.common import Envelope
from app.services.evidence_service import EvidenceAnalysisResult, analyze_documents_contradictions

router = APIRouter(prefix="/evidence", tags=["evidence"])


class DocumentInput(BaseModel):
    id: str | None = None
    fileName: str
    extractedText: str


class EvidenceContradictionRequest(BaseModel):
    documents: list[DocumentInput]


@router.post("/contradictions", response_model=Envelope[EvidenceAnalysisResult])
async def analyze_contradictions(payload: EvidenceContradictionRequest):
    docs = [d.model_dump() for d in payload.documents]
    result = await analyze_documents_contradictions(docs)
    return Envelope(success=True, data=result)
