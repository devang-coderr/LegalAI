"""
Timeline routes -- GET/POST /api/v1/cases/{case_id}/timeline.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_case_access
from app.db.session import get_db
from app.models.case_event import CaseEvent, EventType, TimelineStatus
from app.models.user import User
from app.repositories import timeline_repository
from app.schemas.common import Envelope
from app.schemas.timeline import TimelineEventRequest, TimelineEventResponse

router = APIRouter(prefix="/cases/{case_id}/timeline", tags=["timeline"])


@router.get("", response_model=Envelope[list[TimelineEventResponse]])
async def list_timeline(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_case_access(case_id, current_user, db)
    events = await timeline_repository.list_for_case(db, case_id)
    return Envelope(success=True, data=[_to_response(e) for e in events])


@router.post("", response_model=Envelope[TimelineEventResponse])
async def add_timeline_event(
    case_id: str,
    payload: TimelineEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_case_access(case_id, current_user, db)
    event = CaseEvent(
        case_id=case_id,
        title=payload.title,
        description=payload.description,
        event_date=payload.date,
        event_type=EventType(payload.event_type) if payload.event_type in EventType._member_names_ else EventType.OTHER,
        status=TimelineStatus(payload.status) if payload.status in TimelineStatus._member_names_ else TimelineStatus.COMPLETED,
        linked_document_id=payload.linked_document_id,
        created_by_user_id=current_user.id,
    )
    event = await timeline_repository.create(db, event)
    return Envelope(success=True, data=_to_response(event))


def _to_response(event: CaseEvent) -> TimelineEventResponse:
    return TimelineEventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        date=str(event.event_date) if event.event_date else "",
        status=event.status.value,
        event_type=event.event_type.value,
        linked_document_id=event.linked_document_id,
        created_at=event.created_at,
    )