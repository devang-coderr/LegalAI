"""
FastAPI application entrypoint for LegalAI Platform.
"""
# LegalAI Full-Stack Backend Entrypoint
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from contextlib import asynccontextmanager

from app.api.v1.auth import router as auth_router
from app.api.v1.cases import router as cases_router
from app.api.v1.citizen import router as citizen_router
from app.api.v1.documents import router as documents_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.lawyer import router as lawyer_router
from app.api.v1.lawyers import router as lawyers_router
from app.api.v1.legal import router as legal_router
from app.api.v1.timeline import router as timeline_router
from app.api.v1.chat import router as chat_router
from app.api.v1.hearings import router as hearings_router
from app.ai import qdrant_client
from app.ai.embeddings import warmup_embeddings
from app.ai.llm_client import close_http_client
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.schemas.common import AppError, ErrorDetail


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm embeddings model and Qdrant at server boot so users experience zero cold-start delay
    warmup_embeddings()
    try:
        await qdrant_client.ensure_collection()
    except Exception:
        pass
    yield
    # Graceful shutdown
    await close_http_client()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="LegalAI Full-Stack Backend -- Dual Workspace (Citizen & Lawyer) for Indian Jurisprudence.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global Exception Handlers
# ---------------------------------------------------------------------------

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": exc.message,
            "error": ErrorDetail(code=exc.code, message=exc.message, details=exc.details).model_dump(),
            "meta": None,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "message": "Request validation failed.",
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed.",
                "details": {"errors": exc.errors()},
            },
            "meta": None,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import logging
    logging.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "message": "An unexpected error occurred.",
            "error": {"code": "INTERNAL_ERROR", "message": str(exc), "details": None},
            "meta": None,
        },
    )


# ---------------------------------------------------------------------------
# Router Inclusions under /api/v1
# ---------------------------------------------------------------------------

app.include_router(auth_router, prefix="/api/v1")
app.include_router(cases_router, prefix="/api/v1")
app.include_router(citizen_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(evidence_router, prefix="/api/v1")
app.include_router(lawyer_router, prefix="/api/v1")
app.include_router(lawyers_router, prefix="/api/v1")
app.include_router(legal_router, prefix="/api/v1")
app.include_router(timeline_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(hearings_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    db_status = "unknown"
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {exc}"

    qdrant_status = "connected" if await qdrant_client.health_check() else "unreachable"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": settings.APP_NAME,
        "database": db_status,
        "qdrant": qdrant_status,
    }
