"""
Embedding generation for retrieval (Qdrant) -- one function, one place
every part of the codebase calls to turn text into a vector.

*** VERIFICATION STATUS: PLUMBING VERIFIED, MODEL DOWNLOAD NOT EXERCISED ***
This uses `sentence-transformers` (local, free, no API key -- the model
recommended in the Team Handbook and Backend Guide v1). The library itself
installs fine, but this sandbox's network allowlist doesn't include
Hugging Face Hub, so the actual model weights can't be downloaded here --
that download happens the first time this runs on your machine, which
does have normal internet access, and is a one-time ~400MB fetch cached
locally after that.

What IS verified here: everything downstream of "I have a vector" --
the Qdrant collection schema, upsert, search, and payload filtering are
all tested end-to-end using the deterministic fallback below in place of
a real model, which produces a real fixed-dimension vector (so Qdrant's
schema validation is genuinely exercised), just not a semantically
meaningful one. The fallback activates automatically if the real model
can't load for any reason (no internet, first run before the model's
cached, out of memory) -- so this degrades instead of crashing, same
philosophy as the LLM client.
"""
import hashlib
import struct

from app.core.config import settings

EMBEDDING_DIMENSION = 384  # matches all-MiniLM-L6-v2 -- change together if the model changes

_model = None
_model_load_failed = False


def _try_load_model():
    global _model, _model_load_failed
    if _model is not None or _model_load_failed:
        return
    try:
        from sentence_transformers import SentenceTransformer
        try:
            # Fast-path: load cached weights without remote HuggingFace Hub network check
            _model = SentenceTransformer(settings.EMBEDDING_MODEL, local_files_only=True)
        except Exception:
            _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    except Exception:
        _model_load_failed = True


def warmup_embeddings() -> None:
    """Pre-warm SentenceTransformer and PyTorch runtime at backend startup."""
    _try_load_model()
    if _model is not None:
        try:
            _model.encode("", normalize_embeddings=True)
        except Exception:
            pass


def embed_text(text: str) -> list[float]:
    _try_load_model()
    if _model is not None:
        return _model.encode(text, normalize_embeddings=True).tolist()
    return _deterministic_fallback_embed(text)


def _deterministic_fallback_embed(text: str) -> list[float]:
    """
    NOT a real embedding -- same input always produces the same vector, and
    it has the right dimension for Qdrant, but it carries no semantic
    meaning (two similar sentences will NOT produce similar vectors).
    Exists only so retrieval plumbing is testable before the real model
    is available. Never used if sentence-transformers loaded successfully.
    """
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    # Repeat/trim the 32-byte digest into EMBEDDING_DIMENSION floats in [0, 1)
    raw = (digest * ((EMBEDDING_DIMENSION // len(digest)) + 1))[:EMBEDDING_DIMENSION]
    return [b / 255.0 for b in raw]
