"""
Timeline schemas.
"""
from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel


class TimelineEventRequest(CamelModel):
    title: str
    description: str
    date: str  # human date or ISO date e.g. "10 June 2026"
    status: Literal["COMPLETED", "UPCOMING", "PENDING"] = "COMPLETED"
    event_type: str = "OTHER"
    linked_document_id: str | None = None


class TimelineEventResponse(CamelModel):
    id: str
    title: str
    description: str
    date: str
    status: Literal["COMPLETED", "UPCOMING", "PENDING"]
    event_type: str = "OTHER"
    linked_document_id: str | None = None
    created_at: datetime
