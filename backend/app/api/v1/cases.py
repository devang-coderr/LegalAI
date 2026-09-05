"""
Case routes -- Case Intelligence, listing, creation, and detail retrieval.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional, require_case_access
from app.db.session import get_db
from app.models.case import Case, CasePriority, CaseStatus
from app.models.user import User, UserRole
from app.repositories import case_repository, document_repository
from app.schemas.case import CaseCreateRequest, CaseIntelligenceRequest, CaseResponse, CaseUpdateRequest
from app.schemas.common import AppError, Envelope
from app.schemas.document import DocumentResponse
from app.services import case_intelligence_service, document_service
from app.services.lawyer_service import _infer_case_type

router = APIRouter(prefix="/cases", tags=["cases"])



def _to_case_response(case: Case) -> CaseResponse:
    case_type = _infer_case_type(case.case_type, case.description or case.query_text)
    return CaseResponse(
        id=case.id,
        title=case.title,
        case_number=case.case_number,
        court=case.court,
        bench=case.bench,
        client_id=case.client_id,
        client_name=case.client_name,
        case_type=case_type,
        priority=case.priority.value if case.priority else "MEDIUM",
        assigned_lawyer=case.assigned_lawyer,
        description=case.description or case.query_text,
        status=case.status.value,
        statutory_acts=case.statutory_acts,
        next_hearing_date=case.next_hearing_date,
        intelligence=case.intelligence_result,
        owner_lawyer_id=case.owner_lawyer_id,
        created_at=case.created_at,
    )


@router.post("/intelligence", response_model=Envelope[dict])
async def analyze_case(
    payload: CaseIntelligenceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    case = None
    query_text = payload.query
    if payload.case_id:
        if not current_user:
            raise AppError("UNAUTHORIZED", "Authentication required to analyze a specific case.", status_code=401)
        case = await require_case_access(payload.case_id, current_user, db)
        if not query_text or not query_text.strip():
            query_text = f"{case.title}. {case.description or ''}".strip()

    result = await case_intelligence_service.analyze(query_text)
    data = result.model_dump(by_alias=True)

    if case:
        case.intelligence_result = data
        if result.applicable_laws:
            acts = [law.act_name for law in result.applicable_laws if law.act_name]
            if acts:
                case.statutory_acts = ", ".join(dict.fromkeys(acts))
        case.case_type = _infer_case_type(case.case_type, case.description or query_text)
        await case_repository.update(db, case)
        data["caseId"] = case.id
    else:
        data["caseId"] = payload.case_id

    return Envelope(success=True, data=data)


@router.get("", response_model=Envelope[list[CaseResponse]])
async def list_cases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.LAWYER:
        cases = await case_repository.list_for_lawyer(db, current_user.id)
    else:
        cases = await case_repository.list_for_citizen(db, current_user.id)

    return Envelope(success=True, data=[_to_case_response(c) for c in cases])


@router.post("", response_model=Envelope[CaseResponse])
async def create_case(
    payload: CaseCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = Case(
        owner_user_id=current_user.id if current_user.role == UserRole.CITIZEN else None,
        owner_lawyer_id=current_user.id if current_user.role == UserRole.LAWYER else None,
        title=payload.title,
        case_number=payload.case_number,
        court=payload.court,
        bench=payload.bench,
        client_id=payload.client_id,
        client_name=payload.client_name,
        case_type=payload.case_type,
        priority=CasePriority(payload.priority) if payload.priority else CasePriority.MEDIUM,
        assigned_lawyer=payload.assigned_lawyer or (current_user.name if current_user.role == UserRole.LAWYER else None),
        description=payload.description,
        status=CaseStatus(payload.status) if payload.status else CaseStatus.ACTIVE,
        statutory_acts=payload.statutory_acts,
        next_hearing_date=payload.next_hearing_date,
    )
    case = await case_repository.create(db, case)
    return Envelope(success=True, data=_to_case_response(case))


@router.get("/{case_id}", response_model=Envelope[CaseResponse])
async def get_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = await require_case_access(case_id, current_user, db)
    return Envelope(success=True, data=_to_case_response(case))


@router.patch("/{case_id}", response_model=Envelope[CaseResponse])
async def update_case(
    case_id: str,
    payload: CaseUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = await require_case_access(case_id, current_user, db)

    if payload.title is not None:
        case.title = payload.title
    if payload.case_number is not None:
        case.case_number = payload.case_number
    if payload.court is not None:
        case.court = payload.court
    if payload.bench is not None:
        case.bench = payload.bench
    if payload.client_id is not None:
        case.client_id = payload.client_id
    if payload.client_name is not None:
        case.client_name = payload.client_name
    if payload.case_type is not None:
        case.case_type = payload.case_type
    if payload.priority is not None:
        case.priority = CasePriority(payload.priority)
    if payload.assigned_lawyer is not None:
        case.assigned_lawyer = payload.assigned_lawyer
    if payload.description is not None:
        case.description = payload.description
    if payload.status is not None:
        case.status = CaseStatus(payload.status)
    if payload.statutory_acts is not None:
        case.statutory_acts = payload.statutory_acts
    if payload.next_hearing_date is not None:
        case.next_hearing_date = payload.next_hearing_date

    case = await case_repository.update(db, case)
    return Envelope(success=True, data=_to_case_response(case))


@router.get("/{case_id}/documents", response_model=Envelope[list[DocumentResponse]])
async def list_case_documents(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_case_access(case_id, current_user, db)
    docs = await document_repository.list_for_case(db, case_id)
    return Envelope(success=True, data=[document_service._to_document_response(d) for d in docs])


@router.delete("/{case_id}", response_model=Envelope[dict])
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = await require_case_access(case_id, current_user, db)
    await case_repository.delete(db, case)
    return Envelope(success=True, data={"message": "Case deleted successfully."})
