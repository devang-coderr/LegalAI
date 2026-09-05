"""
Central application configuration.

Every setting the app needs comes from environment variables (loaded from a
.env file in local dev). Nothing here is ever hardcoded -- this is the ONE
place secrets/URLs are read from, so every other module imports `settings`
from here instead of calling os.environ directly.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "LegalAI Backend"
    ENVIRONMENT: str = "development"

    # --- Database (MySQL) ---
    # Format: mysql+asyncmy://<user>:<password>@<host>:<port>/<database>
    DATABASE_URL: str

    # --- Auth ---
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # --- Qdrant ---
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str | None = None

    # --- CORS (Next.js dev server) ---
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- AI / LLM ---
    # If this is left empty, AI-dependent endpoints (case intelligence, legal
    # research, OCR analysis) fall back to a clearly-labelled placeholder
    # response instead of failing outright -- see app/ai/llm_client.py.
    # This is deliberate: it lets auth, persistence, routing, and the response
    # envelope all be built, run, and demoed BEFORE a real key is wired in,
    # which matters when the two are being built against a 2-day deadline.
    LLM_PROVIDER: str = "gemini"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-flash-latest"

    # --- Embeddings + Qdrant ---
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    QDRANT_COLLECTION: str = "legal_chunks"
    RETRIEVAL_TOP_K: int = 5
    RETRIEVAL_MIN_SCORE: float = 0.3  # below this, treat as "no relevant source found"

    # --- File uploads (OCR) ---
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_UPLOAD_TYPES: str = "application/pdf,image/png,image/jpeg"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Imported everywhere else as: from app.core.config import settings
settings = Settings()
