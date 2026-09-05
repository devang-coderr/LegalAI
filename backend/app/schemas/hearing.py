"""
Hearing schemas for Lawyer workspace and Case hearings.
"""
from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel


class HearingCreateRequest(CamelModel):
    case_id: str
    case_title: str
    client_id: str | None = None
    client_name: str = ""
    court: str
    date: str  # yyyy-mm-dd
    time: str = "10:30"  # HH:mm
    hearing_type: str = "Preliminary Hearing"
    prep_notes: str | None = None
    reminder: Literal["NONE", "1_DAY", "3_DAYS", "1_WEEK"] = "1_DAY"


class HearingUpdateRequest(CamelModel):
    court: str | None = None
    date: str | None = None
    time: str | None = None
    hearing_type: str | None = None
    status: Literal["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"] | None = None
    prep_notes: str | None = None
    reminder: Literal["NONE", "1_DAY", "3_DAYS", "1_WEEK"] | None = None
    outcome: str | None = None
    next_hearing_id: str | None = None


class HearingResponse(CamelModel):
    id: str
    case_id: str
    case_title: str
    client_id: str | None = None
    client_name: str
    court: str
    date: str
    time: str
    hearing_type: str
    status: Literal["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"]
    prep_notes: str | None = None
    reminder: Literal["NONE", "1_DAY", "3_DAYS", "1_WEEK"]
    outcome: str | None = None
    next_hearing_id: str | None = None
    created_at: datetime
