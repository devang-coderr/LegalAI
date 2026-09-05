"""
Lawyer schemas for matching, profiles, and dashboard statistics.
"""
from app.schemas.base import CamelModel


class LawyerMatchRequest(CamelModel):
    expertise: str
    case_description: str
    location: str
    language: str


class MatchedLawyer(CamelModel):
    id: str
    name: str
    expertise: list[str] = []
    location: str
    languages: list[str] = []
    experience_years: int = 0
    rating: float = 4.8
    bar_council: str = "Bar Council of India"


class LawyerProfileRequest(CamelModel):
    court: str | None = None
    location: str | None = None
    practice_areas: list[str] = []
    languages: list[str] = []
    experience_years: int | None = None
    bar_council: str | None = None
    is_available: bool | None = None


class LawyerProfileResponse(CamelModel):
    id: str
    user_id: str
    court: str | None = None
    location: str | None = None
    practice_areas: list[str] = []
    languages: list[str] = []
    experience_years: int | None = None
    bar_council: str | None = None
    is_available: bool = True


class LawyerAvailabilityRequest(CamelModel):
    is_available: bool



class LawyerDashboardStatsResponse(CamelModel):
    total: int
    active: int
    settled: int
    closed: int