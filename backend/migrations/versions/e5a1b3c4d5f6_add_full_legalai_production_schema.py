"""Add full LegalAI production schema for clients, documents, notes, requests, and notifications

Revision ID: e5a1b3c4d5f6
Revises: 94ace83410d2
Create Date: 2026-08-31 15:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e5a1b3c4d5f6'
down_revision: Union[str, Sequence[str], None] = '94ace83410d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create clients table
    op.create_table(
        'clients',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('lawyer_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('source', sa.Enum('MANUAL', 'CLIENT_REQUEST', name='clientsource'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['lawyer_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_clients_lawyer_id'), 'clients', ['lawyer_id'], unique=False)

    # 2. Add columns to cases
    try:
        op.add_column('cases', sa.Column('owner_lawyer_id', sa.String(length=36), nullable=True))
        op.add_column('cases', sa.Column('case_number', sa.String(length=100), nullable=True))
        op.add_column('cases', sa.Column('court', sa.String(length=255), server_default='District Court', nullable=False))
        op.add_column('cases', sa.Column('bench', sa.String(length=255), nullable=True))
        op.add_column('cases', sa.Column('client_id', sa.String(length=36), nullable=True))
        op.add_column('cases', sa.Column('client_name', sa.String(length=255), server_default='', nullable=False))
        op.add_column('cases', sa.Column('case_type', sa.String(length=100), nullable=True))
        op.add_column('cases', sa.Column('priority', sa.Enum('HIGH', 'MEDIUM', 'LOW', name='casepriority'), server_default='MEDIUM', nullable=True))
        op.add_column('cases', sa.Column('assigned_lawyer', sa.String(length=255), nullable=True))
        op.add_column('cases', sa.Column('description', sa.Text(), nullable=True))
        op.add_column('cases', sa.Column('statutory_acts', sa.String(length=500), server_default='General Law', nullable=False))
        op.add_column('cases', sa.Column('next_hearing_date', sa.String(length=100), nullable=True))
        op.create_foreign_key('fk_cases_client_id', 'cases', 'clients', ['client_id'], ['id'], ondelete='SET NULL')
        op.create_foreign_key('fk_cases_lawyer_id', 'cases', 'users', ['owner_lawyer_id'], ['id'])
        op.create_index(op.f('ix_cases_owner_lawyer_id'), 'cases', ['owner_lawyer_id'], unique=False)
        op.create_index(op.f('ix_cases_client_id'), 'cases', ['client_id'], unique=False)
    except Exception:
        pass

    # 3. Create documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('lawyer_id', sa.String(length=36), nullable=True),
        sa.Column('client_id', sa.String(length=36), nullable=True),
        sa.Column('case_id', sa.String(length=36), nullable=True),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=100), nullable=False),
        sa.Column('size_bytes', sa.Integer(), server_default='0', nullable=False),
        sa.Column('category', sa.String(length=50), server_default='Uncategorized', nullable=False),
        sa.Column('document_type', sa.String(length=50), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('ocr_result', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('uploading', 'uploaded', 'processing', 'ready', 'failed', name='documentprocessingstatus'), server_default='ready', nullable=False),
        sa.Column('error_message', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['lawyer_id'], ['users.id']),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_documents_user_id'), 'documents', ['user_id'], unique=False)
    op.create_index(op.f('ix_documents_lawyer_id'), 'documents', ['lawyer_id'], unique=False)
    op.create_index(op.f('ix_documents_client_id'), 'documents', ['client_id'], unique=False)
    op.create_index(op.f('ix_documents_case_id'), 'documents', ['case_id'], unique=False)

    # 4. Create document_qa table
    op.create_table(
        'document_qa',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('document_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_document_qa_document_id'), 'document_qa', ['document_id'], unique=False)
    op.create_index(op.f('ix_document_qa_user_id'), 'document_qa', ['user_id'], unique=False)

    # 5. Create research_notes table
    op.create_table(
        'research_notes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('client_id', sa.String(length=36), nullable=False),
        sa.Column('lawyer_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lawyer_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_research_notes_client_id'), 'research_notes', ['client_id'], unique=False)
    op.create_index(op.f('ix_research_notes_lawyer_id'), 'research_notes', ['lawyer_id'], unique=False)

    # 6. Create client_requests table
    op.create_table(
        'client_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('lawyer_id', sa.String(length=36), nullable=False),
        sa.Column('citizen_id', sa.String(length=36), nullable=False),
        sa.Column('client_name', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('case_type', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'DECLINED', name='requeststatus'), server_default='PENDING', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['lawyer_id'], ['users.id']),
        sa.ForeignKeyConstraint(['citizen_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_client_requests_lawyer_id'), 'client_requests', ['lawyer_id'], unique=False)
    op.create_index(op.f('ix_client_requests_citizen_id'), 'client_requests', ['citizen_id'], unique=False)

    # 7. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('category', sa.Enum('request', 'hearing', 'case', 'document', 'system', name='notificationcategory'), server_default='system', nullable=False),
        sa.Column('read', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('client_requests')
    op.drop_table('research_notes')
    op.drop_table('document_qa')
    op.drop_table('documents')
    op.drop_table('clients')
