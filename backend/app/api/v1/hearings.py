"""Hearing routes -- GET/POST /api/v1/cases/{case_id}/hearings and
PATCH .../hearings/{hearing_id} for post-hearing summaries."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_case_access
from app.db.session import get_db
from app.models.hearing import Hearing, HearingReminder, HearingStatus
from app.models.user import User
from app.repositories import hearing_repository
from app.schemas.common import AppError, Envelope
from app.schemas.hearing import HearingCreateRequest, HearingResponse, HearingUpdateRequest

router = APIRouter(prefix="/cases/{case_id}/hearings", tags=["hearings"])


@router.get("", response_model=Envelope[list[HearingResponse]])
async def list_hearings(case_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await require_case_access(case_id, current_user, db)
    hearings = await hearing_repository.list_for_case(db, case_id)
    return Envelope(success=True, data=[_to_response(h) for h in hearings])


@router.post("", response_model=Envelope[HearingResponse])
async def schedule_hearing(
    case_id: str, payload: HearingCreateRequest,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    await require_case_access(case_id, current_user, db)
    hearing = Hearing(
        case_id=case_id,
        lawyer_id=current_user.id if current_user.role.value == "LAWYER" else None,
        client_id=payload.client_id,
        case_title=payload.case_title,
        client_name=payload.client_name,
        court=payload.court,
        date=payload.date,
        time=payload.time,
        hearing_type=payload.hearing_type,
        prep_notes=payload.prep_notes,
        reminder=HearingReminder(payload.reminder),
        status=HearingStatus.SCHEDULED,
    )
    hearing = await hearing_repository.create(db, hearing)
    return Envelope(success=True, data=_to_response(hearing))


@router.patch("/{hearing_id}", response_model=Envelope[HearingResponse])
async def record_hearing_outcome(
    case_id: str, hearing_id: str, payload: HearingUpdateRequest,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    await require_case_access(case_id, current_user, db)
    hearing = await hearing_repository.get_by_id(db, hearing_id)
    if not hearing or hearing.case_id != case_id:
        raise AppError("NOT_FOUND", "Hearing not found.", status_code=404)

    if payload.court is not None:
        hearing.court = payload.court
    if payload.date is not None:
        hearing.date = payload.date
    if payload.time is not None:
        hearing.time = payload.time
    if payload.hearing_type is not None:
        hearing.hearing_type = payload.hearing_type
    if payload.status is not None:
        hearing.status = HearingStatus(payload.status)
    if payload.prep_notes is not None:
        hearing.prep_notes = payload.prep_notes
    if payload.reminder is not None:
        hearing.reminder = HearingReminder(payload.reminder)
    if payload.outcome is not None:
        hearing.outcome = payload.outcome
    if payload.next_hearing_id is not None:
        hearing.next_hearing_id = payload.next_hearing_id

    hearing = await hearing_repository.update(db, hearing)
    return Envelope(success=True, data=_to_response(hearing))


def _to_response(hearing: Hearing) -> HearingResponse:
    return HearingResponse(
        id=hearing.id,
        case_id=hearing.case_id,
        case_title=hearing.case_title,
        client_id=hearing.client_id,
        client_name=hearing.client_name,
        court=hearing.court,
        date=hearing.date,
        time=hearing.time,
        hearing_type=hearing.hearing_type,
        status=hearing.status.value,
        prep_notes=hearing.prep_notes,
        reminder=hearing.reminder.value,
        outcome=hearing.outcome,
        next_hearing_id=hearing.next_hearing_id,
        created_at=hearing.created_at,
    )