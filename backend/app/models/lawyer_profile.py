"""
Lawyer profile -- the richer profile P0 deliberately deferred. Now needed
for real: matching requires practice areas, location, and languages.

MySQL has no array column type (unlike Postgres) -- practice_areas and
languages are stored as JSON arrays of strings. Matching reads them with
a Python-side intersection check rather than a SQL array operator; fine
at this data volume, and avoids MySQL-specific JSON query syntax that
would make the matching logic harder to read and test.
"""
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)

    court: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    practice_areas: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    languages: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    experience_years: Mapped[int | None] = mapped_column(nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )