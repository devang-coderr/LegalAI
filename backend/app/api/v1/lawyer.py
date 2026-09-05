"""
Lawyer Workspace Router -- dedicated endpoints for Lawyer Dashboard, Clients, Cases, Hearings, Notes, Documents, and Notifications.
"""
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.case import Case, CasePriority, CaseStatus
from app.models.client import Client, ClientSource
from app.models.hearing import Hearing, HearingReminder, HearingStatus
from app.models.research_note import ResearchNote
from app.models.user import User, UserRole
from app.repositories import (
    case_repository,
    client_repository,
    client_request_repository,
    document_repository,
    hearing_repository,
    note_repository,
    notification_repository,
)
from app.schemas.case import CaseCreateRequest, CaseResponse, CaseUpdateRequest
from app.schemas.client import ClientCreateRequest, ClientResponse, ClientUpdateRequest
from app.schemas.common import AppError, Envelope
from app.schemas.document import DocumentResponse
from app.schemas.hearing import HearingCreateRequest, HearingResponse, HearingUpdateRequest
from app.schemas.lawyer import LawyerDashboardStatsResponse
from app.schemas.note import ResearchNoteCreateRequest, ResearchNoteResponse, ResearchNoteUpdateRequest
from app.schemas.notification import ClientRequestRespond, ClientRequestResponse, NotificationResponse
from app.services import document_service, lawyer_service

router = APIRouter(prefix="/lawyer", tags=["lawyer-workspace"])


def _require_lawyer(user: User):
    if user.role != UserRole.LAWYER:
        raise AppError("FORBIDDEN", "Only verified lawyers can access the lawyer workspace.", status_code=403)


# --- Dashboard Stats ---
@router.get("/dashboard-stats", response_model=Envelope[LawyerDashboardStatsResponse])
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    stats = await lawyer_service.get_dashboard_stats(db, current_user.id)
    return Envelope(success=True, data=stats)


# --- Clients ---
@router.get("/clients", response_model=Envelope[list[ClientResponse]])
async def list_clients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    clients = await client_repository.list_for_lawyer(db, current_user.id)
    return Envelope(
        success=True,
        data=[
            ClientResponse(
                id=c.id,
                name=c.name,
                phone=c.phone,
                email=c.email,
                address=c.address,
                source=c.source.value,
                created_at=c.created_at,
            )
            for c in clients
        ],
    )


@router.post("/clients", response_model=Envelope[ClientResponse])
async def create_client(
    payload: ClientCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    client = Client(
        lawyer_id=current_user.id,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        source=ClientSource.MANUAL,
    )
    client = await client_repository.create(db, client)
    return Envelope(
        success=True,
        data=ClientResponse(
            id=client.id,
            name=client.name,
            phone=client.phone,
            email=client.email,
            address=client.address,
            source=client.source.value,
            created_at=client.created_at,
        ),
    )


@router.get("/clients/{client_id}", response_model=Envelope[dict])
async def get_client_detail(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    client = await client_repository.get_by_id(db, client_id)
    if not client or client.lawyer_id != current_user.id:
        raise AppError("NOT_FOUND", "Client not found.", status_code=404)

    # Linked cases
    cases = await case_repository.list_for_client(db, client.id)
    # Linked documents
    docs = await document_repository.list_for_client(db, client.id)
    # Linked notes
    notes = await note_repository.list_for_client(db, client.id, current_user.id)
    # Linked hearings
    hearings = await hearing_repository.list_for_client(db, client.id)

    return Envelope(
        success=True,
        data={
            "client": ClientResponse(
                id=client.id,
                name=client.name,
                phone=client.phone,
                email=client.email,
                address=client.address,
                source=client.source.value,
                created_at=client.created_at,
            ).model_dump(by_alias=True),
            "cases": [
                {
                    "id": c.id,
                    "title": c.title,
                    "caseNumber": c.case_number,
                    "court": c.court,
                    "status": c.status.value,
                    "priority": c.priority.value if c.priority else "MEDIUM",
                    "nextHearingDate": c.next_hearing_date,
                    "createdAt": c.created_at.isoformat(),
                }
                for c in cases
            ],
            "documents": [document_service._to_document_response(d).model_dump(by_alias=True) for d in docs],
            "notes": [
                {
                    "id": n.id,
                    "clientId": n.client_id,
                    "title": n.title,
                    "content": n.content,
                    "createdAt": n.created_at.isoformat(),
                    "updatedAt": n.updated_at.isoformat(),
                }
                for n in notes
            ],
            "hearings": [
                {
                    "id": h.id,
                    "caseId": h.case_id,
                    "caseTitle": h.case_title,
                    "court": h.court,
                    "date": h.date,
                    "time": h.time,
                    "hearingType": h.hearing_type,
                    "status": h.status.value,
                }
                for h in hearings
            ],
        },
    )


@router.patch("/clients/{client_id}", response_model=Envelope[ClientResponse])
async def update_client(
    client_id: str,
    payload: ClientUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    client = await client_repository.get_by_id(db, client_id)
    if not client or client.lawyer_id != current_user.id:
        raise AppError("NOT_FOUND", "Client not found.", status_code=404)

    if payload.name is not None:
        client.name = payload.name
    if payload.phone is not None:
        client.phone = payload.phone
    if payload.email is not None:
        client.email = payload.email
    if payload.address is not None:
        client.address = payload.address

    client = await client_repository.update(db, client)
    return Envelope(
        success=True,
        data=ClientResponse(
            id=client.id,
            name=client.name,
            phone=client.phone,
            email=client.email,
            address=client.address,
            source=client.source.value,
            created_at=client.created_at,
        ),
    )


@router.delete("/clients/{client_id}", response_model=Envelope[dict])
async def delete_client(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    client = await client_repository.get_by_id(db, client_id)
    if not client or client.lawyer_id != current_user.id:
        raise AppError("NOT_FOUND", "Client not found.", status_code=404)

    await client_repository.delete(db, client)
    return Envelope(success=True, data={"message": "Client deleted successfully."})


# --- Notes ---
@router.get("/notes", response_model=Envelope[list[ResearchNoteResponse]])
async def list_notes(
    client_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    if client_id:
        notes = await note_repository.list_for_client(db, client_id, current_user.id)
    else:
        notes = await note_repository.list_for_lawyer(db, current_user.id)

    return Envelope(
        success=True,
        data=[
            ResearchNoteResponse(
                id=n.id,
                client_id=n.client_id,
                title=n.title,
                content=n.content,
                created_at=n.created_at,
                updated_at=n.updated_at,
            )
            for n in notes
        ],
    )


@router.post("/notes", response_model=Envelope[ResearchNoteResponse])
async def create_note(
    payload: ResearchNoteCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    note = ResearchNote(
        client_id=payload.client_id,
        lawyer_id=current_user.id,
        title=payload.title,
        content=payload.content,
    )
    note = await note_repository.create(db, note)
    return Envelope(
        success=True,
        data=ResearchNoteResponse(
            id=note.id,
            client_id=note.client_id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        ),
    )


@router.patch("/notes/{note_id}", response_model=Envelope[ResearchNoteResponse])
async def update_note(
    note_id: str,
    payload: ResearchNoteUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    note = await note_repository.get_by_id(db, note_id)
    if not note or note.lawyer_id != current_user.id:
        raise AppError("NOT_FOUND", "Note not found.", status_code=404)

    if payload.title is not None:
        note.title = payload.title
    if payload.content is not None:
        note.content = payload.content

    note = await note_repository.update(db, note)
    return Envelope(
        success=True,
        data=ResearchNoteResponse(
            id=note.id,
            client_id=note.client_id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        ),
    )


@router.delete("/notes/{note_id}", response_model=Envelope[dict])
async def delete_note(
    note_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    note = await note_repository.get_by_id(db, note_id)
    if not note or note.lawyer_id != current_user.id:
        raise AppError("NOT_FOUND", "Note not found.", status_code=404)

    await note_repository.delete(db, note)
    return Envelope(success=True, data={"message": "Note deleted successfully."})


# --- Hearings ---
@router.get("/hearings", response_model=Envelope[list[HearingResponse]])
async def list_hearings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    hearings = await hearing_repository.list_for_lawyer(db, current_user.id)
    return Envelope(
        success=True,
        data=[
            HearingResponse(
                id=h.id,
                case_id=h.case_id,
                case_title=h.case_title,
                client_id=h.client_id,
                client_name=h.client_name,
                court=h.court,
                date=h.date,
                time=h.time,
                hearing_type=h.hearing_type,
                status=h.status.value,
                prep_notes=h.prep_notes,
                reminder=h.reminder.value,
                outcome=h.outcome,
                next_hearing_id=h.next_hearing_id,
                created_at=h.created_at,
            )
            for h in hearings
        ],
    )


@router.post("/hearings", response_model=Envelope[HearingResponse])
async def create_hearing(
    payload: HearingCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    hearing = Hearing(
        case_id=payload.case_id,
        lawyer_id=current_user.id,
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
    return Envelope(
        success=True,
        data=HearingResponse(
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
        ),
    )


@router.patch("/hearings/{hearing_id}", response_model=Envelope[HearingResponse])
async def update_hearing(
    hearing_id: str,
    payload: HearingUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    hearing = await hearing_repository.get_by_id(db, hearing_id)
    if not hearing or hearing.lawyer_id != current_user.id:
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
    return Envelope(
        success=True,
        data=HearingResponse(
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
        ),
    )


@router.delete("/hearings/{hearing_id}", response_model=Envelope[dict])
async def delete_hearing(
    hearing_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    hearing = await hearing_repository.get_by_id(db, hearing_id)
    if not hearing or hearing.lawyer_id != current_user.id:
        raise AppError("NOT_FOUND", "Hearing not found.", status_code=404)

    await hearing_repository.delete(db, hearing)
    return Envelope(success=True, data={"message": "Hearing deleted successfully."})


# --- Notifications & Client Requests ---
@router.get("/notifications", response_model=Envelope[dict])
async def get_lawyer_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    notifs = await notification_repository.list_for_user(db, current_user.id)
    requests = await client_request_repository.list_for_lawyer(db, current_user.id)

    return Envelope(
        success=True,
        data={
            "notifications": [
                NotificationResponse(
                    id=n.id,
                    title=n.title,
                    text=n.text,
                    category=n.category.value,
                    read=n.read,
                    created_at=n.created_at,
                ).model_dump(by_alias=True)
                for n in notifs
            ],
            "clientRequests": [
                ClientRequestResponse(
                    id=r.id,
                    lawyer_id=r.lawyer_id,
                    citizen_id=r.citizen_id,
                    client_name=r.client_name,
                    summary=r.summary,
                    case_type=r.case_type,
                    status=r.status.value,
                    created_at=r.created_at,
                    responded_at=r.responded_at,
                ).model_dump(by_alias=True)
                for r in requests
            ],
        },
    )


@router.post("/client-requests/{request_id}/respond", response_model=Envelope[ClientRequestResponse])
async def respond_client_request(
    request_id: str,
    payload: ClientRequestRespond,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    result = await lawyer_service.respond_to_client_request(
        db, current_user.id, request_id, payload.accept
    )
    return Envelope(success=True, data=result)
