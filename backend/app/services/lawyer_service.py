"""
Lawyer service -- Matching, Directory, Dashboard stats, and Consultation Request management.
"""
from datetime import datetime, timezone
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case import Case, CaseStatus
from app.models.client import Client, ClientSource
from app.models.client_request import ClientRequest, RequestStatus
from app.models.notification import NotificationCategory
from app.models.user import User, UserRole
from app.repositories import (
    case_repository,
    client_repository,
    client_request_repository,
    lawyer_repository,
    notification_repository,
    user_repository,
)
from app.schemas.common import AppError
from app.schemas.lawyer import MatchedLawyer, LawyerDashboardStatsResponse, LawyerProfileResponse
from app.schemas.notification import ClientRequestResponse


EXPERTISE_KEYWORDS: dict[str, list[str]] = {
    "criminal": ["criminal", "bail", "cyber", "ipc", "bns", "penal", "ndps", "offence", "offense"],
    "family": ["family", "divorce", "matrimonial", "domestic", "custody", "maintenance", "marriage", "adoption", "alimony"],
    "property": ["property", "land", "real estate", "rent", "tenancy", "title", "deed", "eviction", "lease", "possession"],
    "civil": ["civil", "litigation", "contract", "recovery", "injunction", "tort", "dispute", "writs", "specific relief"],
    "consumer": ["consumer", "dispute", "redressal", "e-commerce", "product", "deficiency", "protection", "rera"],
    "corporate": ["corporate", "company", "commercial", "arbitration", "m&a", "mergers", "business", "insolvency", "nclt", "banking"],
    "employment": ["employment", "labour", "labor", "service", "workplace", "industrial", "severance", "termination", "gratuity", "provident"],
    "cyber": ["cyber", "it act", "data privacy", "digital", "technology", "internet", "electronic", "hacking"],
    "tax": ["tax", "gst", "income tax", "customs", "excise", "revenue", "direct tax", "indirect tax"],
    "ip": ["ip", "intellectual property", "patent", "trademark", "copyright", "design", "trade secret", "infringement"],
}


async def match_lawyers(
    db: AsyncSession,
    expertise: str,
    location: str,
    language: str,
    case_description: str,
) -> list[MatchedLawyer]:
    """Matches ONLY real registered lawyers from the database. Never returns fake/mock lawyers."""
    candidates = await lawyer_repository.search_candidates(db)
    results: list[MatchedLawyer] = []

    expertise_clean = (expertise or "").strip().lower()
    location_clean = (location or "").strip().lower()
    language_clean = (language or "").strip().lower()

    for profile, user in candidates:
        # Check location
        if location_clean and location_clean not in ("all", ""):
            prof_loc = (profile.location or "").lower()
            prof_court = (profile.court or "").lower()
            user_court = (user.court_admission or "").lower()
            user_bar = (user.bar_council or "").lower()
            if not (location_clean in prof_loc or location_clean in prof_court or location_clean in user_court or location_clean in user_bar):
                continue

        # Check expertise
        if expertise_clean and expertise_clean not in ("all", ""):
            prof_areas = [str(a).lower() for a in (profile.practice_areas or [])]
            if prof_areas:
                keywords = EXPERTISE_KEYWORDS.get(expertise_clean, [expertise_clean])
                matched = False
                for area in prof_areas:
                    if "general" in area or "all" in area or expertise_clean in area:
                        matched = True
                        break
                    for kw in keywords:
                        if kw in area or area in kw:
                            matched = True
                            break
                    if matched:
                        break
                if not matched:
                    continue

        # Check language
        if language_clean and language_clean not in ("all", ""):
            prof_langs = [str(l).lower() for l in (profile.languages or [])]
            if prof_langs and language_clean not in prof_langs and not any(language_clean in l for l in prof_langs):
                continue

        matched_exp = profile.practice_areas if profile.practice_areas else ["General Practice"]
        results.append(
            MatchedLawyer(
                id=user.id,
                name=user.name,
                expertise=matched_exp,
                location=profile.location or user.court_admission or "India",
                languages=profile.languages if profile.languages else [],
                experience_years=profile.experience_years if profile.experience_years is not None else 0,
                rating=4.8,
                bar_council=user.bar_council or "State Bar Council",
            )
        )

    return results


def _infer_case_type(case_type_hint: str | None, summary: str | None) -> str:
    summary_lower = (summary or "").lower()

    # Domain indicators in summary have high precedence for classification
    if any(w in summary_lower for w in ["salary", "wage", "wages", "employer", "employee", "unpaid salary", "severance", "gratuity", "workplace", "wrongful termination"]):
        return "Labour / Employment Law"
    if any(w in summary_lower for w in ["security deposit", "landlord", "tenant", "tenancy", "rent", "eviction", "lease"]):
        return "Property & Tenancy Law"
    if any(w in summary_lower for w in ["defective", "refund", "consumer", "e-commerce", "product warranty"]):
        return "Consumer Protection"
    if any(w in summary_lower for w in ["divorce", "custody", "maintenance", "matrimonial", "alimony"]):
        return "Family & Matrimonial Law"
    if any(w in summary_lower for w in ["bail", "fir", "police", "arrest", "criminal", "theft", "assault"]):
        return "Criminal Law"

    if case_type_hint:
        hint_lower = case_type_hint.strip().lower()
        hint_map = {
            "employment": "Labour / Employment Law",
            "labour": "Labour / Employment Law",
            "criminal": "Criminal Law",
            "family": "Family & Matrimonial Law",
            "property": "Property & Tenancy Law",
            "civil": "Civil Dispute / Litigation",
            "consumer": "Consumer Protection",
            "corporate": "Corporate & Commercial Law",
            "cyber": "Cyber Law",
            "tax": "Taxation Law",
            "ip": "Intellectual Property",
        }
        if hint_lower in hint_map:
            return hint_map[hint_lower]
        return case_type_hint.strip()

    return "Civil Dispute / General Legal Matter"


async def get_dashboard_stats(db: AsyncSession, lawyer_id: str) -> LawyerDashboardStatsResponse:
    stats = await case_repository.get_lawyer_stats(db, lawyer_id)
    return LawyerDashboardStatsResponse(
        total=stats["total"],
        active=stats["active"],
        settled=stats["settled"],
        closed=stats["closed"],
    )


async def set_lawyer_availability(db: AsyncSession, lawyer_id: str, is_available: bool) -> LawyerProfileResponse:
    profile = await lawyer_repository.get_or_create_by_user_id(db, lawyer_id)
    profile.is_available = is_available
    profile = await lawyer_repository.create_or_update(db, profile)
    lawyer = await user_repository.get_by_id(db, lawyer_id)
    return LawyerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        court=profile.court,
        location=profile.location,
        practice_areas=profile.practice_areas,
        languages=profile.languages,
        experience_years=profile.experience_years,
        bar_council=lawyer.bar_council if lawyer else None,
        is_available=profile.is_available,
    )


async def send_client_request(
    db: AsyncSession, citizen_id: str, lawyer_id: str, summary: str, case_type: str | None = None
) -> ClientRequestResponse:
    citizen = await user_repository.get_by_id(db, citizen_id)
    if not citizen:
        raise AppError("NOT_FOUND", "Citizen user not found.", status_code=404)

    lawyer = await user_repository.get_by_id(db, lawyer_id)
    if not lawyer or lawyer.role != UserRole.LAWYER or not lawyer.is_active:
        raise AppError("NOT_FOUND", "Advocate not found or inactive.", status_code=404)

    profile = await lawyer_repository.get_or_create_by_user_id(db, lawyer_id)
    if not profile.is_available:
        raise AppError("UNAVAILABLE", "This advocate is currently not accepting new consultation requests.", status_code=400)

    # Prevent duplicate pending request to the same lawyer for the same matter
    existing_pending = await client_request_repository.find_active_pending(db, citizen_id, lawyer_id, summary)
    if existing_pending:
        raise AppError("DUPLICATE_REQUEST", "You already have an active pending consultation request with this advocate for this matter.", status_code=400)

    req = ClientRequest(
        lawyer_id=lawyer_id,
        citizen_id=citizen_id,
        client_name=citizen.name,
        summary=summary,
        case_type=case_type or "General Civil",
        status=RequestStatus.PENDING,
    )
    req = await client_request_repository.create(db, req)

    # Notify lawyer
    await notification_repository.create(
        db,
        user_id=lawyer_id,
        title="New Client Consultation Request",
        text=f"{citizen.name} sent a request regarding: {summary[:100]}...",
        category=NotificationCategory.REQUEST,
    )

    return ClientRequestResponse(
        id=req.id,
        lawyer_id=req.lawyer_id,
        lawyer_name=lawyer.name,
        citizen_id=req.citizen_id,
        client_name=req.client_name,
        summary=req.summary,
        case_type=req.case_type,
        status=req.status.value,
        created_at=req.created_at,
    )


async def cancel_client_request(
    db: AsyncSession, citizen_id: str, request_id: str
) -> ClientRequestResponse:
    req = await client_request_repository.get_by_id(db, request_id)
    if not req:
        raise AppError("NOT_FOUND", "Client request not found.", status_code=404)
    if req.citizen_id != citizen_id:
        raise AppError("FORBIDDEN", "You can only cancel your own consultation requests.", status_code=403)
    if req.status != RequestStatus.PENDING:
        raise AppError(
            "BAD_REQUEST",
            f"Cannot cancel request with status {req.status.value}. Only PENDING requests can be cancelled.",
            status_code=400,
        )

    req.status = RequestStatus.CANCELLED
    req.responded_at = datetime.now(timezone.utc)
    req = await client_request_repository.update(db, req)

    lawyer = await user_repository.get_by_id(db, req.lawyer_id)
    lawyer_name = lawyer.name if lawyer else "Advocate"

    # Notify lawyer that the request was cancelled
    await notification_repository.create(
        db,
        user_id=req.lawyer_id,
        title="Consultation Request Cancelled",
        text=f"{req.client_name} has cancelled their consultation request regarding: {req.summary[:80]}...",
        category=NotificationCategory.REQUEST,
    )

    return ClientRequestResponse(
        id=req.id,
        lawyer_id=req.lawyer_id,
        lawyer_name=lawyer_name,
        citizen_id=req.citizen_id,
        client_name=req.client_name,
        summary=req.summary,
        case_type=req.case_type,
        status=req.status.value,
        created_at=req.created_at,
        responded_at=req.responded_at,
    )


async def respond_to_client_request(
    db: AsyncSession, lawyer_id: str, request_id: str, accept: bool
) -> ClientRequestResponse:
    req = await client_request_repository.get_by_id(db, request_id)
    if not req:
        raise AppError("NOT_FOUND", "Client request not found.", status_code=404)
    if req.lawyer_id != lawyer_id:
        raise AppError("FORBIDDEN", "This request is not assigned to you.", status_code=403)

    lawyer = await user_repository.get_by_id(db, lawyer_id)
    lawyer_name = lawyer.name if lawyer else "Advocate"

    # Disallow responding to cancelled requests
    if req.status == RequestStatus.CANCELLED:
        raise AppError("BAD_REQUEST", "This request was cancelled by the citizen and is no longer active.", status_code=400)

    # Idempotency guard: If already in requested state, do not duplicate Client or Case creation
    if req.status == RequestStatus.ACCEPTED and accept:
        return ClientRequestResponse(
            id=req.id,
            lawyer_id=req.lawyer_id,
            lawyer_name=lawyer_name,
            citizen_id=req.citizen_id,
            client_name=req.client_name,
            summary=req.summary,
            case_type=req.case_type,
            status=req.status.value,
            created_at=req.created_at,
            responded_at=req.responded_at,
        )

    if req.status == RequestStatus.DECLINED and not accept:
        return ClientRequestResponse(
            id=req.id,
            lawyer_id=req.lawyer_id,
            lawyer_name=lawyer_name,
            citizen_id=req.citizen_id,
            client_name=req.client_name,
            summary=req.summary,
            case_type=req.case_type,
            status=req.status.value,
            created_at=req.created_at,
            responded_at=req.responded_at,
        )

    if req.status != RequestStatus.PENDING:
        raise AppError("BAD_REQUEST", f"Cannot respond to request with status {req.status.value}.", status_code=400)

    req.status = RequestStatus.ACCEPTED if accept else RequestStatus.DECLINED
    req.responded_at = datetime.now(timezone.utc)
    req = await client_request_repository.update(db, req)

    if accept:
        # 1. Create client for lawyer
        citizen = await user_repository.get_by_id(db, req.citizen_id)
        client = Client(
            lawyer_id=lawyer_id,
            name=req.client_name,
            email=citizen.email if citizen else None,
            phone=citizen.phone if citizen else None,
            source=ClientSource.CLIENT_REQUEST,
        )
        client = await client_repository.create(db, client)

        # 2. Create case
        case_type = _infer_case_type(req.case_type, req.summary)
        case = Case(
            owner_user_id=req.citizen_id,
            owner_lawyer_id=lawyer_id,
            client_id=client.id,
            client_name=req.client_name,
            title=f"Matter: {req.summary[:80]}",
            court="District Court",
            case_type=case_type,
            description=req.summary,
            status=CaseStatus.ACTIVE,
            assigned_lawyer=lawyer_name,
        )
        await case_repository.create(db, case)

        # 3. Notify citizen
        await notification_repository.create(
            db,
            user_id=req.citizen_id,
            title="Consultation Request Accepted",
            text=f"{lawyer_name} has accepted your consultation request and created your case matter.",
            category=NotificationCategory.REQUEST,
        )
    else:
        # Notify citizen of decline
        await notification_repository.create(
            db,
            user_id=req.citizen_id,
            title="Consultation Request Declined",
            text=f"{lawyer_name} is currently unavailable for new matters.",
            category=NotificationCategory.REQUEST,
        )

    return ClientRequestResponse(
        id=req.id,
        lawyer_id=req.lawyer_id,
        lawyer_name=lawyer_name,
        citizen_id=req.citizen_id,
        client_name=req.client_name,
        summary=req.summary,
        case_type=req.case_type,
        status=req.status.value,
        created_at=req.created_at,
        responded_at=req.responded_at,
    )
