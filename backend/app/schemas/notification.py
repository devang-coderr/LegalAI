"""
Notification and Client Request schemas.
"""
from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel


class NotificationResponse(CamelModel):
    id: str
    title: str
    text: str
    category: Literal["request", "hearing", "case", "document", "system"]
    read: bool
    created_at: datetime


class ClientRequestCreate(CamelModel):
    lawyer_id: str
    summary: str
    case_type: str | None = None


class ClientRequestRespond(CamelModel):
    accept: bool


class ClientRequestResponse(CamelModel):
    id: str
    lawyer_id: str
    lawyer_name: str | None = None
    citizen_id: str
    client_name: str
    summary: str
    case_type: str | None = None
    status: Literal["PENDING", "ACCEPTED", "DECLINED", "CANCELLED"]
    created_at: datetime
    responded_at: datetime | None = None
