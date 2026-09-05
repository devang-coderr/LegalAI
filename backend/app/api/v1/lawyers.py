"""
Lawyers routes for citizen lawyer-matching and directory discovery.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories import lawyer_repository
from app.schemas.common import AppError, Envelope
from app.schemas.lawyer import (
    LawyerMatchRequest,
    MatchedLawyer,
    LawyerProfileRequest,
    LawyerProfileResponse,
    LawyerAvailabilityRequest,
)
from app.schemas.notification import ClientRequestCreate, ClientRequestResponse
from app.services import lawyer_service

router = APIRouter(prefix="/lawyers", tags=["lawyers"])


@router.post("/match", response_model=Envelope[list[MatchedLawyer]])
async def match_lawyers(
    payload: LawyerMatchRequest,
    db: AsyncSession = Depends(get_db),
):
    results = await lawyer_service.match_lawyers(
        db=db,
        expertise=payload.expertise,
        location=payload.location,
        language=payload.language,
        case_description=payload.case_description,
    )
    return Envelope(success=True, data=results)


@router.get("/directory", response_model=Envelope[list[MatchedLawyer]])
async def get_directory(
    db: AsyncSession = Depends(get_db),
):
    results = await lawyer_service.match_lawyers(
        db=db,
        expertise="All",
        location="All",
        language="All",
        case_description="",
    )
    return Envelope(success=True, data=results)


@router.get("/profile", response_model=Envelope[LawyerProfileResponse])
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.LAWYER:
        raise AppError("FORBIDDEN", "Only lawyers have a lawyer profile.", status_code=403)

    profile = await lawyer_repository.get_or_create_by_user_id(db, current_user.id)
    return Envelope(
        success=True,
        data=LawyerProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            court=profile.court,
            location=profile.location,
            practice_areas=profile.practice_areas,
            languages=profile.languages,
            experience_years=profile.experience_years,
            bar_council=current_user.bar_council,
            is_available=profile.is_available,
        ),
    )


@router.post("/profile", response_model=Envelope[LawyerProfileResponse])
async def create_or_update_profile(
    payload: LawyerProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.LAWYER:
        raise AppError("FORBIDDEN", "Only lawyers can create or update a lawyer profile.", status_code=403)

    profile = await lawyer_repository.get_or_create_by_user_id(db, current_user.id)
    if payload.court is not None:
        profile.court = payload.court
    if payload.location is not None:
        profile.location = payload.location
    if payload.practice_areas:
        profile.practice_areas = payload.practice_areas
    if payload.languages:
        profile.languages = payload.languages
    if payload.experience_years is not None:
        profile.experience_years = payload.experience_years
    if payload.is_available is not None:
        profile.is_available = payload.is_available

    profile = await lawyer_repository.create_or_update(db, profile)
    return Envelope(
        success=True,
        data=LawyerProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            court=profile.court,
            location=profile.location,
            practice_areas=profile.practice_areas,
            languages=profile.languages,
            experience_years=profile.experience_years,
            bar_council=current_user.bar_council,
            is_available=profile.is_available,
        ),
    )


@router.patch("/availability", response_model=Envelope[LawyerProfileResponse])
async def update_availability(
    payload: LawyerAvailabilityRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.LAWYER:
        raise AppError("FORBIDDEN", "Only lawyers can update availability.", status_code=403)

    result = await lawyer_service.set_lawyer_availability(db, current_user.id, payload.is_available)
    return Envelope(success=True, data=result)



@router.post("/requests", response_model=Envelope[ClientRequestResponse])
async def create_client_request(
    payload: ClientRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await lawyer_service.send_client_request(
        db=db,
        citizen_id=current_user.id,
        lawyer_id=payload.lawyer_id,
        summary=payload.summary,
        case_type=payload.case_type,
    )
    return Envelope(success=True, data=result)