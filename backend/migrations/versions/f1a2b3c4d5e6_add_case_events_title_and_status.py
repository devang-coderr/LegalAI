"""Add title and status columns to case_events table

Revision ID: f1a2b3c4d5e6
Revises: e5a1b3c4d5f6
Create Date: 2026-09-05 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e5a1b3c4d5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('case_events', sa.Column('title', sa.String(length=255), server_default='', nullable=False))
    op.add_column(
        'case_events',
        sa.Column(
            'status',
            sa.Enum('COMPLETED', 'UPCOMING', 'PENDING', name='timelinestatus'),
            server_default='COMPLETED',
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column('case_events', 'status')
    op.drop_column('case_events', 'title')
