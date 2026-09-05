"""
Research Note schemas for Lawyer client profile.
"""
from datetime import datetime

from app.schemas.base import CamelModel


class ResearchNoteCreateRequest(CamelModel):
    client_id: str
    title: str
    content: str


class ResearchNoteUpdateRequest(CamelModel):
    title: str | None = None
    content: str | None = None


class ResearchNoteResponse(CamelModel):
    id: str
    client_id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
