"""
Qdrant client wrapper -- the ONLY file that imports qdrant_client directly.
Everything else calls `search()` or `upsert_chunks()`.

Cross-user data leakage prevention (Part 18/Part 34's mandatory AI security
requirement): the legal knowledge base (Acts, judgments) has NO per-user
data in it at all -- it's shared public legal content, not user documents.
That's what makes "one user's private documents can never appear in
another user's retrieval results" structurally true here rather than a
runtime check: this collection never receives a user document in the
first place. If/when document-level RAG (searching a specific case's own
uploaded documents) gets built, that's a SEPARATE Qdrant collection or a
mandatory payload filter on `case_id` + an ownership check before the
search ever runs -- flagging this now so it's designed in from the start
of that feature, not patched on after.
"""
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, ScoredPoint

from app.ai.embeddings import EMBEDDING_DIMENSION
from app.core.config import settings

_client: AsyncQdrantClient | None = None


def get_client() -> AsyncQdrantClient:
    global _client
    if _client is None:
        _client = AsyncQdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY or None)
    return _client


async def ensure_collection() -> None:
    """Idempotent -- safe to call on every startup. Creates the collection only if missing."""
    client = get_client()
    exists = await client.collection_exists(settings.QDRANT_COLLECTION)
    if not exists:
        await client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE),
        )


async def upsert_chunks(points: list[PointStruct]) -> None:
    client = get_client()
    await client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)


async def search(query_vector: list[float], limit: int, court_filter: str | None = None) -> list[ScoredPoint]:
    from qdrant_client.models import Filter, FieldCondition, MatchValue

    query_filter = None
    if court_filter and court_filter != "ALL":
        query_filter = Filter(must=[FieldCondition(key="court", match=MatchValue(value=court_filter))])

    client = get_client()
    result = await client.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=query_vector,
        limit=limit,
        query_filter=query_filter,
        with_payload=True,
    )
    return result.points


async def health_check() -> bool:
    try:
        client = get_client()
        await client.collection_exists(settings.QDRANT_COLLECTION)
        return True
    except Exception:
        return False
