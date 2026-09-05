"""
Database engine and session factory.

Async SQLAlchemy 2.0 style, talking to MySQL through the `asyncmy` driver.
FastAPI is async end-to-end -- a synchronous driver here would block the
whole event loop on every query, which is the wrong trade for a service
where six people and a live demo hit the same server.

Every route that needs the database depends on `get_db`, which hands out
one session per request and always closes it, even if the route raises.
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # detects a dropped connection before using it, not after
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Every SQLAlchemy model in app/models/ inherits from this."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency -- `db: AsyncSession = Depends(get_db)` in a route."""
    async with AsyncSessionLocal() as session:
        yield session
