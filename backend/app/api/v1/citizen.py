"""
Citizen Workspace Router -- cases, timeline, notifications, and sent lawyer requests.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories import (
    case_repository,
    client_request_repository,
    notification_repository,
    timeline_repository,
    user_repository,
)
from app.schemas.case import CaseResponse
from app.schemas.common import Envelope
from app.schemas.notification import ClientRequestResponse, NotificationResponse
from app.schemas.timeline import TimelineEventResponse
from app.api.v1.cases import _to_case_response
from app.services import lawyer_service

router = APIRouter(prefix="/citizen", tags=["citizen-workspace"])



@router.get("/cases", response_model=Envelope[list[CaseResponse]])
async def get_citizen_cases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cases = await case_repository.list_for_citizen(db, current_user.id)
    return Envelope(success=True, data=[_to_case_response(c) for c in cases])


@router.get("/timeline", response_model=Envelope[list[TimelineEventResponse]])
async def get_citizen_timeline(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch events for user's cases
    cases = await case_repository.list_for_citizen(db, current_user.id)
    events = []
    for c in cases:
        case_events = await timeline_repository.list_for_case(db, c.id)
        for ce in case_events:
            events.append(
                TimelineEventResponse(
                    id=ce.id,
                    title=ce.title or c.title,
                    description=ce.description,
                    date=str(ce.event_date) if ce.event_date else "",
                    status=ce.status.value,
                    event_type=ce.event_type.value,
                    linked_document_id=ce.linked_document_id,
                    created_at=ce.created_at,
                )
            )

    return Envelope(success=True, data=events)


@router.get("/notifications", response_model=Envelope[list[NotificationResponse]])
async def get_citizen_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifs = await notification_repository.list_for_user(db, current_user.id)
    return Envelope(
        success=True,
        data=[
            NotificationResponse(
                id=n.id,
                title=n.title,
                text=n.text,
                category=n.category.value,
                read=n.read,
                created_at=n.created_at,
            )
            for n in notifs
        ],
    )


@router.patch("/notifications/read-all", response_model=Envelope[dict])
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await notification_repository.mark_all_read(db, current_user.id)
    return Envelope(success=True, data={"message": "All notifications marked as read."})


@router.get("/lawyer-requests", response_model=Envelope[list[ClientRequestResponse]])
async def get_sent_lawyer_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reqs = await client_request_repository.list_for_citizen(db, current_user.id)
    items = []
    for r in reqs:
        lawyer = await user_repository.get_by_id(db, r.lawyer_id)
        items.append(
            ClientRequestResponse(
                id=r.id,
                lawyer_id=r.lawyer_id,
                lawyer_name=lawyer.name if lawyer else "Advocate",
                citizen_id=r.citizen_id,
                client_name=r.client_name,
                summary=r.summary,
                case_type=r.case_type,
                status=r.status.value,
                created_at=r.created_at,
                responded_at=r.responded_at,
            )
        )
    return Envelope(success=True, data=items)


@router.post("/lawyer-requests/{request_id}/cancel", response_model=Envelope[ClientRequestResponse])
async def cancel_lawyer_request(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await lawyer_service.cancel_client_request(db, current_user.id, request_id)
    return Envelope(success=True, data=result)
