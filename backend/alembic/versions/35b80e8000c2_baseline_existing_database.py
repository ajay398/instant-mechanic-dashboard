"""baseline existing database

Revision ID: 35b80e8000c2
Revises:
Create Date: 2026-09-01
"""

from typing import Sequence, Union

from alembic import op


# ============================================================
# REVISION IDENTIFIERS
# ============================================================

revision: str = "35b80e8000c2"

down_revision: Union[str, Sequence[str], None] = None

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


# ============================================================
# UPGRADE
# ============================================================

def upgrade() -> None:
    """
    Mark the existing database as the initial Alembic baseline.

    The database already contains all application tables,
    therefore this migration intentionally performs no schema
    changes.
    """
    pass


# ============================================================
# DOWNGRADE
# ============================================================

def downgrade() -> None:
    """
    Baseline migration has no schema changes to reverse.
    """
    pass