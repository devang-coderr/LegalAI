"""
Database initialization and seed script.
Creates all tables and seeds verified lawyer profiles and legal knowledge.

Run with: python scripts/init_db.py
"""
import asyncio
import os
import sys
import uuid
from pathlib import Path

# Add backend directory to python path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, Base, AsyncSessionLocal
from app.models import (
    User,
    UserRole,
    VerificationStatus,
    LawyerProfile,
    Case,
    CaseStatus,
    CasePriority,
    Client,
    ClientSource,
    Document,
    DocumentCategory,
    Hearing,
    HearingStatus,
    HearingReminder,
    ResearchNote,
    ClientRequest,
    RequestStatus,
    Notification,
    NotificationCategory,
    CaseEvent,
    TimelineStatus,
    EventType,
)
from app.security.password import hash_password
from app.ai import qdrant_client
from scripts.seed_legal_knowledge import SAMPLE_CHUNKS, main as seed_qdrant_chunks


async def init_tables():
    print("Creating all database tables via SQLAlchemy async engine...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")


async def seed_initial_users():
    print("Seeding initial demo users and lawyer profiles...")
    async with AsyncSessionLocal() as db:
        # Check if citizen demo user exists
        from sqlalchemy import select
        res = await db.execute(select(User).where(User.email == "citizen@legalai.in"))
        citizen = res.scalar_one_or_none()
        if not citizen:
            citizen = User(
                id=str(uuid.uuid4()),
                name="Aarav Sharma",
                email="citizen@legalai.in",
                password_hash=hash_password("citizen123"),
                role=UserRole.CITIZEN,
                phone="+91 9876543210",
                is_active=True,
            )
            db.add(citizen)
            await db.commit()
            print("Created demo citizen: citizen@legalai.in / citizen123")

        # Check if lawyer demo user exists
        res = await db.execute(select(User).where(User.email == "lawyer@legalai.in"))
        lawyer = res.scalar_one_or_none()
        if not lawyer:
            lawyer_id = str(uuid.uuid4())
            lawyer = User(
                id=lawyer_id,
                name="Adv. Rajesh Sharma",
                email="lawyer@legalai.in",
                password_hash=hash_password("lawyer123"),
                role=UserRole.LAWYER,
                phone="+91 9811223344",
                bar_number="D/1420/2006",
                bar_council="Bar Council of Delhi",
                court_admission="Supreme Court of India & Delhi High Court",
                verification_status=VerificationStatus.VERIFIED,
                is_active=True,
            )
            db.add(lawyer)
            await db.commit()

            # Create lawyer profile
            profile = LawyerProfile(
                id=str(uuid.uuid4()),
                user_id=lawyer_id,
                court="Supreme Court of India",
                location="New Delhi",
                practice_areas=["Constitutional Law", "Civil Litigation", "Property Disputes"],
                languages=["English", "Hindi"],
                experience_years=18,
            )
            db.add(profile)
            await db.commit()
            print("Created demo verified lawyer: lawyer@legalai.in / lawyer123")


async def main():
    try:
        await init_tables()
        await seed_initial_users()
    except Exception as exc:
        print(f"Database init exception: {exc}")

    # Seed Qdrant if available
    try:
        await seed_qdrant_chunks()
    except Exception as exc:
        print(f"Qdrant seed skipped: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
