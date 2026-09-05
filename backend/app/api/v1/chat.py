"""
AI Assistant chat routes -- JSON response and SSE streaming.
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.schemas.common import Envelope
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=Envelope[ChatMessageResponse])
async def chat_message(payload: ChatMessageRequest):
    result = await chat_service.answer_query(payload.message)
    return Envelope(success=True, data=result)


@router.post("/stream")
async def chat_stream(payload: ChatMessageRequest):
    return StreamingResponse(
        chat_service.stream_chat_response(payload.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
