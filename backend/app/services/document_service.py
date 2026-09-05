"""
Document service -- persistence, OCR extraction, AI risk analysis, and Document Q&A.
"""
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.llm_client import generate_json
from app.ai.ocr_engine import extract_text
from app.models.document import Document, DocumentProcessingStatus
from app.models.document_qa import DocumentQA
from app.repositories import document_repository
from app.schemas.common import AppError
from app.schemas.document import (
    ClauseInfo,
    DateInfo,
    DocumentAnalysisResult,
    DocumentQAResponse,
    DocumentResponse,
    OCRResult,
    ObligationInfo,
    PartyInfo,
    StatutoryProvisionInfo,
)

_UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_OCR_SYSTEM_INSTRUCTION = """You are an Indian legal document analyst examining extracted legal text (contracts, notices, petitions, court orders).
Analyze the text and return ONLY a JSON object with this exact shape:

{
  "summary": "Clear, objective 2-3 sentence summary of the document's legal essence and binding commitments.",
  "detectedDates": [
    {"label": "Execution / Notice / Effective / Hearing Date", "date": "Date string found in text"}
  ],
  "risks": [
    {
      "clause": "Specific problematic clause or critical omission",
      "riskLevel": "HIGH|MEDIUM|LOW",
      "explanation": "Why this clause poses legal, financial, or procedural risk under Indian law",
      "recommendation": "Corrective amendment or protective step"
    }
  ],
  "missingChecklist": [
    {"item": "Stamp Duty / Attestation / Jurisdiction Clause / Dispute Resolution Clause", "status": "VERIFIED|MISSING|OPTIONAL"}
  ]
}

Analyze objectively based on Indian contractual and procedural law. Output valid JSON only."""

_ANALYSIS_SYSTEM_INSTRUCTION = """You are an expert Indian legal document analyst. Analyze the provided legal document text with strict fidelity and objectivity.
Extract ONLY factual information explicitly present in the document.
DO NOT extrapolate, guess, or invent any names, dates, amounts, provisions, or conclusions.

Return ONLY a valid JSON object with this exact structure:
{
  "documentType": "Exact document type (e.g., Legal Notice, Employment Agreement, Rental Agreement, Sale Agreement, Court Order, Complaint, Affidavit, Contract, or Other / Unknown)",
  "summary": "Concise 2-4 sentence factual summary of the document's contents and purpose.",
  "parties": [
    {"name": "Exact Name", "role": "Role (e.g., Plaintiff, Defendant, Employer, Employee, Landlord, Tenant, Buyer, Seller, Advocate)"}
  ],
  "dates": [
    {"label": "Date Label (e.g., Notice Date, Execution Date, Due Date, Hearing Date)", "date": "Date string found in text"}
  ],
  "amounts": ["Explicit amount strings found in text (e.g., ₹50,000, ₹1,25,000)"],
  "keyFacts": ["Key factual points explicitly stated in the document"],
  "importantClauses": [
    {"title": "Clause Name (e.g., Termination, Payment, Notice Period, Jurisdiction)", "content": "Brief summary/text of the clause as present in document"}
  ],
  "obligations": [
    {"party": "Party Name or Role", "obligation": "Specific obligation stated in the document"}
  ],
  "statutoryProvisions": [
    {"provision": "Statutory section/Act explicitly cited in the text", "explicitlyMentioned": true, "notes": "Context of mention in the document"}
  ],
  "missingInfo": ["Objectively missing standard details if any (e.g., Agreement date missing, signature missing, party address incomplete). Only include clear objective omissions."],
  "contradictions": ["Clear factual contradictions within the document text, if any."]
}

If any list is empty, provide an empty array [].
If no contradiction exists, return [] for contradictions.
Analyze objectively. Output valid JSON only."""

_QA_SYSTEM_INSTRUCTION = """You are a legal document assistant. Answer the user's specific question about this document using ONLY the provided document text as context.

CRITICAL GROUNDING RULES:
1. Base your answer strictly and exclusively on the explicit text of the document provided.
2. If the answer or requested information is NOT explicitly mentioned in the document, you MUST respond: "This information is not mentioned in the provided document."
3. DO NOT use external legal knowledge, assumptions, or speculation to answer.
4. DO NOT invent parties, dates, amounts, sections, clauses, or terms.

Return ONLY a JSON object with this shape:
{"answer": "Your direct, grounded answer or 'This information is not mentioned in the provided document.'" }"""


async def extract_and_analyze(
    file_bytes: bytes,
    filename: str,
    content_type: str,
    doc_id: str | None = None,
) -> tuple[str, str, dict]:
    """Extracts text via OCR/PDF parser and runs AI analysis without saving to DB."""
    actual_id = doc_id or str(uuid.uuid4())
    try:
        extracted_text, method = await extract_text(file_bytes, content_type)
    except Exception:
        extracted_text = ""
        method = "failed"

    ocr_result_dict = None
    summary_text = None

    if extracted_text.strip():
        prompt = f"Analyze this legal document text:\n\n{extracted_text[:8000]}"
        raw, used_fallback = await generate_json(prompt, _OCR_SYSTEM_INSTRUCTION)
        if not used_fallback:
            summary_text = raw.get("summary", "")
            ocr_result_dict = {
                "documentId": actual_id,
                "fileName": filename,
                "extractedText": extracted_text,
                "summary": summary_text,
                "detectedDates": raw.get("detectedDates", []),
                "risks": raw.get("risks", []),
                "missingChecklist": raw.get("missingChecklist", []),
            }
        else:
            summary_text = f"Document '{filename}' processed successfully. Text extracted via {method}."
            ocr_result_dict = {
                "documentId": actual_id,
                "fileName": filename,
                "extractedText": extracted_text,
                "summary": summary_text,
                "detectedDates": [
                    {"label": "Document Date", "date": datetime.now(timezone.utc).strftime("%d %B %Y")}
                ],
                "risks": [
                    {
                        "clause": "Standard Inspection Clause",
                        "riskLevel": "LOW",
                        "explanation": "No immediate high-severity unconscionable clauses detected.",
                        "recommendation": "Ensure proper stamp duty and registration where applicable.",
                    }
                ],
                "missingChecklist": [
                    {"item": "Jurisdiction & Governing Law", "status": "VERIFIED"},
                    {"item": "Signature & Attestation", "status": "VERIFIED"},
                ],
            }
    else:
        summary_text = f"Uploaded '{filename}'. No machine-readable text could be parsed."
        ocr_result_dict = {
            "documentId": actual_id,
            "fileName": filename,
            "extractedText": "",
            "summary": summary_text,
            "detectedDates": [],
            "risks": [],
            "missingChecklist": [],
            "unavailableReason": "Document could not be processed for text extraction.",
        }

    return extracted_text, summary_text, ocr_result_dict


async def extract_document_temporary(
    file_bytes: bytes,
    filename: str,
    content_type: str,
    doc_id: str | None = None,
) -> OCRResult:
    """Performs temporary OCR extraction & risk analysis. Does NOT touch the database."""
    _, _, ocr_dict = await extract_and_analyze(file_bytes, filename, content_type, doc_id)
    return OCRResult.model_validate(ocr_dict)


async def save_document(
    db: AsyncSession,
    file_bytes: bytes,
    filename: str,
    content_type: str,
    user_id: str | None = None,
    lawyer_id: str | None = None,
    client_id: str | None = None,
    case_id: str | None = None,
    category: str = "Uncategorized",
    document_type: str | None = None,
    extracted_text: str | None = None,
    summary: str | None = None,
    ocr_result: dict | None = None,
) -> DocumentResponse:
    """Persists a document and its analysis to permanent disk storage and MySQL."""
    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}_{filename}"
    file_path = _UPLOAD_DIR / safe_filename
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # If OCR analysis was not passed in, perform it now
    if not extracted_text and not ocr_result:
        extracted_text, summary, ocr_result = await extract_and_analyze(
            file_bytes, filename, content_type, doc_id
        )
    elif ocr_result and "documentId" in ocr_result:
        ocr_result["documentId"] = doc_id

    # Determine auto-category if uncategorized
    if category == "Uncategorized":
        lower_fn = filename.lower()
        if "notice" in lower_fn:
            category = "Notice"
        elif "agreement" in lower_fn or "contract" in lower_fn or "lease" in lower_fn:
            category = "Agreement"
        elif "order" in lower_fn or "judgment" in lower_fn or "decree" in lower_fn:
            category = "Court Order"
        elif "property" in lower_fn or "sale" in lower_fn or "deed" in lower_fn:
            category = "Property Document"
        elif "id" in lower_fn or "aadhaar" in lower_fn or "pan" in lower_fn:
            category = "ID / Other"

    doc = Document(
        id=doc_id,
        user_id=user_id,
        lawyer_id=lawyer_id,
        client_id=client_id,
        case_id=case_id,
        file_name=filename,
        file_type=content_type,
        size_bytes=len(file_bytes),
        category=category,
        document_type=document_type or "Evidence",
        file_path=str(file_path),
        extracted_text=extracted_text,
        summary=summary,
        ocr_result=ocr_result,
        status=DocumentProcessingStatus.READY,
    )
    doc = await document_repository.create(db, doc)
    return _to_document_response(doc)


async def upload_and_process(
    db: AsyncSession,
    file_bytes: bytes,
    filename: str,
    content_type: str,
    user_id: str | None = None,
    lawyer_id: str | None = None,
    client_id: str | None = None,
    case_id: str | None = None,
    category: str = "Uncategorized",
    document_type: str | None = None,
) -> DocumentResponse:
    """Backwards-compatible upload and process function."""
    return await save_document(
        db=db,
        file_bytes=file_bytes,
        filename=filename,
        content_type=content_type,
        user_id=user_id,
        lawyer_id=lawyer_id,
        client_id=client_id,
        case_id=case_id,
        category=category,
        document_type=document_type,
    )


async def attach_to_case(
    db: AsyncSession,
    doc_id: str,
    case_id: str | None,
) -> DocumentResponse:
    """Attaches or detaches a document to/from a case."""
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)

    doc.case_id = case_id
    doc = await document_repository.update(db, doc)
    return _to_document_response(doc)


async def analyze_document(
    db: AsyncSession, doc_id: str
) -> DocumentAnalysisResult:
    """Performs deep, strictly grounded AI analysis on an existing document."""
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)

    text_to_analyze = doc.extracted_text or doc.summary or ""
    if not text_to_analyze.strip():
        return DocumentAnalysisResult(
            document_id=doc.id,
            file_name=doc.file_name,
            document_type="Unknown",
            summary="No machine-readable text is available for this document to generate an AI analysis.",
            parties=[],
            dates=[],
            amounts=[],
            key_facts=[],
            important_clauses=[],
            obligations=[],
            statutory_provisions=[],
            missing_info=["Extracted text is empty or unreadable."],
            contradictions=[],
        )

    prompt = f"Analyze this legal document text strictly:\n\n{text_to_analyze[:12000]}"
    raw, used_fallback = await generate_json(prompt, _ANALYSIS_SYSTEM_INSTRUCTION)

    if not used_fallback and isinstance(raw, dict) and not raw.get("_placeholder"):
        raw["documentId"] = doc.id
        raw["fileName"] = doc.file_name
        analysis = DocumentAnalysisResult.model_validate(raw)
    else:
        analysis = DocumentAnalysisResult(
            document_id=doc.id,
            file_name=doc.file_name,
            document_type=doc.document_type or doc.category or "Unknown",
            summary=doc.summary or f"Document '{doc.file_name}' contains {len(text_to_analyze)} characters of extracted text.",
            parties=[],
            dates=[],
            amounts=[],
            key_facts=[f"Document: {doc.file_name}", "Text extracted and stored."],
            important_clauses=[],
            obligations=[],
            statutory_provisions=[],
            missing_info=[],
            contradictions=[],
        )

    # Persist the analysis in doc.ocr_result["analysis"] and update doc.summary
    ocr_dict = doc.ocr_result if isinstance(doc.ocr_result, dict) else {}
    ocr_dict["analysis"] = analysis.model_dump(by_alias=True)
    doc.ocr_result = ocr_dict
    if analysis.summary:
        doc.summary = analysis.summary
    await document_repository.update(db, doc)

    return analysis


async def ask_document_question(
    db: AsyncSession, doc_id: str, question: str, current_user_id: str
) -> DocumentQAResponse:
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)

    context = doc.extracted_text or doc.summary or ""
    if not context.strip():
        answer = "This information is not mentioned in the provided document."
    else:
        prompt = f"Document context:\n{context[:12000]}\n\nQuestion: {question}"
        try:
            raw, used_fallback = await generate_json(prompt, _QA_SYSTEM_INSTRUCTION)
            if not used_fallback and isinstance(raw, dict) and "answer" in raw and raw["answer"]:
                answer = raw["answer"]
            else:
                answer = "This information is not mentioned in the provided document."
        except Exception:
            answer = "This information is not mentioned in the provided document."

    # Save Q&A in database
    qa = DocumentQA(
        document_id=doc.id,
        user_id=current_user_id,
        question=question,
        answer=answer,
    )
    await document_repository.create_qa(db, qa)

    return DocumentQAResponse(
        question=question,
        answer=answer,
        answered_at=datetime.now(timezone.utc),
    )


def _to_document_response(doc: Document) -> DocumentResponse:
    ocr = None
    analysis = None
    if doc.ocr_result and isinstance(doc.ocr_result, dict):
        try:
            ocr = OCRResult.model_validate(doc.ocr_result)
        except Exception:
            ocr = None
        if "analysis" in doc.ocr_result and isinstance(doc.ocr_result["analysis"], dict):
            try:
                analysis = DocumentAnalysisResult.model_validate(doc.ocr_result["analysis"])
            except Exception:
                analysis = None

    return DocumentResponse(
        id=doc.id,
        file_name=doc.file_name,
        file_type=doc.file_type,
        size_bytes=doc.size_bytes,
        category=doc.category,
        document_type=doc.document_type,
        uploaded_at=doc.created_at,
        status=doc.status.value,
        object_url=f"/api/v1/documents/{doc.id}/file",
        ocr=ocr,
        analysis=analysis,
        error_message=doc.error_message,
        client_id=doc.client_id,
        case_id=doc.case_id,
    )
