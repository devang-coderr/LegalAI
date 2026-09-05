import json
import os
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional, require_case_access
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories import document_repository
from app.schemas.common import AppError, Envelope
from app.schemas.document import (
    DocumentAnalysisResult,
    DocumentAttachCaseRequest,
    DocumentCategoryUpdateRequest,
    DocumentQARequest,
    DocumentQAResponse,
    DocumentResponse,
    OCRResult,
)
from app.services import document_service

router = APIRouter(prefix="/documents", tags=["documents"])

_ALLOWED_TYPES = set(settings.ALLOWED_UPLOAD_TYPES.split(","))


@router.post("/extract", response_model=Envelope[OCRResult])
async def extract_document_ocr(
    file: UploadFile = File(...),
):
    """Performs temporary OCR extraction & risk analysis without saving to the database."""
    if file.content_type not in _ALLOWED_TYPES:
        raise AppError(
            "INVALID_FILE_TYPE",
            f"File type '{file.content_type}' is not supported. Allowed: {settings.ALLOWED_UPLOAD_TYPES}",
            status_code=415,
        )

    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise AppError("FILE_TOO_LARGE", f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.", status_code=413)
    if len(file_bytes) == 0:
        raise AppError("EMPTY_FILE", "The uploaded file is empty.", status_code=400)

    result = await document_service.extract_document_temporary(
        file_bytes=file_bytes,
        filename=file.filename or "unnamed_document.pdf",
        content_type=file.content_type,
    )
    return Envelope(success=True, data=result)


@router.post("", response_model=Envelope[DocumentResponse])
async def save_document(
    file: UploadFile = File(...),
    category: str = Form("Uncategorized"),
    client_id: str | None = Form(None),
    case_id: str | None = Form(None),
    document_type: str | None = Form(None),
    extracted_text: str | None = Form(None),
    summary: str | None = Form(None),
    ocr_result_json: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Persists a document and its analysis into the user's permanent document repository."""
    if file.content_type not in _ALLOWED_TYPES:
        raise AppError(
            "INVALID_FILE_TYPE",
            f"File type '{file.content_type}' is not supported. Allowed: {settings.ALLOWED_UPLOAD_TYPES}",
            status_code=415,
        )

    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise AppError("FILE_TOO_LARGE", f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.", status_code=413)
    if len(file_bytes) == 0:
        raise AppError("EMPTY_FILE", "The uploaded file is empty.", status_code=400)

    if case_id:
        await require_case_access(case_id, current_user, db)

    user_id = current_user.id if current_user.role == UserRole.CITIZEN else None
    lawyer_id = current_user.id if current_user.role == UserRole.LAWYER else None

    parsed_ocr = None
    if ocr_result_json:
        try:
            parsed_ocr = json.loads(ocr_result_json)
        except Exception:
            parsed_ocr = None

    result = await document_service.save_document(
        db=db,
        file_bytes=file_bytes,
        filename=file.filename or "unnamed_document.pdf",
        content_type=file.content_type,
        user_id=user_id,
        lawyer_id=lawyer_id,
        client_id=client_id,
        case_id=case_id,
        category=category,
        document_type=document_type,
        extracted_text=extracted_text,
        summary=summary,
        ocr_result=parsed_ocr,
    )
    return Envelope(success=True, data=result)



@router.post("/ocr", response_model=Envelope[DocumentResponse])
async def ocr_document(
    file: UploadFile = File(...),
    category: str = Form("Uncategorized"),
    client_id: str | None = Form(None),
    case_id: str | None = Form(None),
    document_type: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    if file.content_type not in _ALLOWED_TYPES:
        raise AppError(
            "INVALID_FILE_TYPE",
            f"File type '{file.content_type}' is not supported. Allowed: {settings.ALLOWED_UPLOAD_TYPES}",
            status_code=415,
        )

    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise AppError("FILE_TOO_LARGE", f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.", status_code=413)
    if len(file_bytes) == 0:
        raise AppError("EMPTY_FILE", "The uploaded file is empty.", status_code=400)

    user_id = current_user.id if current_user and current_user.role == UserRole.CITIZEN else None
    lawyer_id = current_user.id if current_user and current_user.role == UserRole.LAWYER else None

    result = await document_service.upload_and_process(
        db=db,
        file_bytes=file_bytes,
        filename=file.filename or "unnamed_document.pdf",
        content_type=file.content_type,
        user_id=user_id,
        lawyer_id=lawyer_id,
        client_id=client_id,
        case_id=case_id,
        category=category,
        document_type=document_type,
    )
    return Envelope(success=True, data=result)


async def _require_document_access(doc, current_user: User, db: AsyncSession):
    if doc.user_id == current_user.id or doc.lawyer_id == current_user.id:
        return
    if doc.case_id:
        from app.api.deps import require_case_access
        await require_case_access(doc.case_id, current_user, db)
        return
    raise AppError("FORBIDDEN", "You do not have access to this document.", status_code=403)


@router.get("", response_model=Envelope[list[DocumentResponse]])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    docs = await document_repository.list_for_user(db, current_user.id)
    return Envelope(success=True, data=[document_service._to_document_response(d) for d in docs])


@router.get("/{doc_id}", response_model=Envelope[DocumentResponse])
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)
    await _require_document_access(doc, current_user, db)
    return Envelope(success=True, data=document_service._to_document_response(doc))


@router.patch("/{doc_id}/case", response_model=Envelope[DocumentResponse])
async def attach_case(
    doc_id: str,
    payload: DocumentAttachCaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)
    await _require_document_access(doc, current_user, db)

    if payload.case_id:
        await require_case_access(payload.case_id, current_user, db)

    result = await document_service.attach_to_case(db, doc_id, payload.case_id)
    return Envelope(success=True, data=result)


@router.patch("/{doc_id}/category", response_model=Envelope[DocumentResponse])
async def update_category(
    doc_id: str,
    payload: DocumentCategoryUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)
    await _require_document_access(doc, current_user, db)
    doc.category = payload.category
    doc = await document_repository.update(db, doc)
    return Envelope(success=True, data=document_service._to_document_response(doc))



@router.delete("/{doc_id}", response_model=Envelope[dict])
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)
    await _require_document_access(doc, current_user, db)

    # Delete file from disk if exists
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass

    await document_repository.delete(db, doc)
    return Envelope(success=True, data={"message": "Document deleted successfully."})


@router.post("/{doc_id}/analyze", response_model=Envelope[DocumentAnalysisResult])
async def analyze_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates structured, strictly grounded AI intelligence for a document."""
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)
    await _require_document_access(doc, current_user, db)

    result = await document_service.analyze_document(db, doc_id)
    return Envelope(success=True, data=result)


@router.post("/{doc_id}/ask", response_model=Envelope[DocumentQAResponse])
async def ask_document(
    doc_id: str,
    payload: DocumentQARequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc:
        raise AppError("NOT_FOUND", "Document not found.", status_code=404)
    await _require_document_access(doc, current_user, db)

    result = await document_service.ask_document_question(
        db, doc_id, payload.question, current_user.id
    )
    return Envelope(success=True, data=result)


@router.get("/{doc_id}/file")
async def get_document_file(
    doc_id: str,
    download: bool = False,
    db: AsyncSession = Depends(get_db),
):
    doc = await document_repository.get_by_id(db, doc_id)
    if not doc or not os.path.exists(doc.file_path):
        raise AppError("NOT_FOUND", "File not found on storage.", status_code=404)

    disposition = "attachment" if download else "inline"
    return FileResponse(
        path=doc.file_path,
        media_type=doc.file_type or "application/octet-stream",
        filename=doc.file_name,
        content_disposition_type=disposition,
    )
