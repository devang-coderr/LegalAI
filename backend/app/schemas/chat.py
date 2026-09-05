"""
Chat schemas for AI Assistant.
"""
from app.schemas.base import CamelModel


class ChatMessageRequest(CamelModel):
    message: str
    case_id: str | None = None
    document_id: str | None = None


class ChatMessageResponse(CamelModel):
    id: str
    sender: str  # "ai"
    text: str
    citations: list[str] = []
