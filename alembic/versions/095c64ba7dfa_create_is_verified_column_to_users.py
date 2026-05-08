""" create is_verified column to users

Revision ID: 095c64ba7dfa
Revises: 
Create Date: 2025-10-10 17:45:29.996501

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '095c64ba7dfa'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users' , sa.Column('is_verified', sa.String() , nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users' , 'is_verified')
