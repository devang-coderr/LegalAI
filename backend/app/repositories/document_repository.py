"""
Document repository for Citizen and Lawyer documents.
"""
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.models.document_qa import DocumentQA


async def create(db: AsyncSession, doc: Document) -> Document:
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def get_by_id(db: AsyncSession, doc_id: str) -> Document | None:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    return result.scalar_one_or_none()


async def list_for_user(db: AsyncSession, user_id: str) -> list[Document]:
    result = await db.execute(
        select(Document).where(or_(Document.user_id == user_id, Document.lawyer_id == user_id)).order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_lawyer(db: AsyncSession, lawyer_id: str) -> list[Document]:
    result = await db.execute(
        select(Document).where(Document.lawyer_id == lawyer_id).order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_client(db: AsyncSession, client_id: str) -> list[Document]:
    result = await db.execute(
        select(Document).where(Document.client_id == client_id).order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_case(db: AsyncSession, case_id: str) -> list[Document]:
    result = await db.execute(
        select(Document).where(Document.case_id == case_id).order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


async def update(db: AsyncSession, doc: Document) -> Document:
    await db.commit()
    await db.refresh(doc)
    return doc


async def delete(db: AsyncSession, doc: Document) -> None:
    await db.delete(doc)
    await db.commit()


async def create_qa(db: AsyncSession, qa: DocumentQA) -> DocumentQA:
    db.add(qa)
    await db.commit()
    await db.refresh(qa)
    return qa


async def list_qa_for_document(db: AsyncSession, doc_id: str) -> list[DocumentQA]:
    result = await db.execute(
        select(DocumentQA).where(DocumentQA.document_id == doc_id).order_by(DocumentQA.created_at.desc())
    )
    return list(result.scalars().all())
