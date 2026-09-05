"""
Client schemas for Lawyer workspace.
"""
from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel


class ClientCreateRequest(CamelModel):
    name: str
    phone: str
    email: str | None = None
    address: str | None = None


class ClientUpdateRequest(CamelModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None


class ClientResponse(CamelModel):
    id: str
    name: str
    phone: str
    email: str | None = None
    address: str | None = None
    source: Literal["MANUAL", "CLIENT_REQUEST"]
    created_at: datetime
