"""
User schemas.
"""
from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel


class RegisterRequest(CamelModel):
    email: str
    password: str
    name: str
    role: Literal["CITIZEN", "LAWYER"]
    phone: str | None = None
    bar_number: str | None = None
    bar_council: str | None = None
    court_admission: str | None = None
    court: str | None = None
    location: str | None = None
    practice_areas: list[str] = []
    languages: list[str] = []
    experience_years: int | None = None


class LoginRequest(CamelModel):
    email: str
    password: str
    role: str | None = None


class UserResponse(CamelModel):
    id: str
    name: str
    email: str
    role: str
    phone: str | None = None
    avatar_url: str | None = None
    bar_number: str | None = None
    bar_enrolment_number: str | None = None
    bar_council: str | None = None
    court_admission: str | None = None
    court: str | None = None
    location: str | None = None
    practice_areas: list[str] = []
    languages: list[str] = []
    experience_years: int | None = None
    verification_status: str | None = None
    created_at: datetime | None = None


class AuthResponse(CamelModel):
    token: str
    user: UserResponse


class ProfileUpdateRequest(CamelModel):
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    bar_number: str | None = None
    bar_council: str | None = None
    court_admission: str | None = None
    court: str | None = None
    location: str | None = None
    practice_areas: list[str] | None = None
    languages: list[str] | None = None
    experience_years: int | None = None


class PasswordChangeRequest(CamelModel):
    current_password: str
    new_password: str


class LawyerVerificationUpdateRequest(CamelModel):
    verification_status: Literal["VERIFIED", "PENDING", "REJECTED"]
