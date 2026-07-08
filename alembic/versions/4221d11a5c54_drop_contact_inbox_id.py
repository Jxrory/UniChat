"""drop_contact_inbox_id

Revision ID: 4221d11a5c54
Revises: 36f478faac54
Create Date: 2026-07-08 15:48:13.186454

For production DBs created before the ContactInbox refactor,
this drops the obsolete inbox_id column from contacts.
Idempotent — safe to run on fresh DBs where the column doesn't exist.

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '4221d11a5c54'
down_revision: Union[str, Sequence[str], None] = '36f478faac54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    if "inbox_id" not in {c["name"] for c in inspector.get_columns("contacts")}:
        return
    with op.batch_alter_table("contacts") as batch_op:
        batch_op.drop_column("inbox_id")


def downgrade() -> None:
    with op.batch_alter_table("contacts") as batch_op:
        batch_op.add_column(sa.Column("inbox_id", sa.String, nullable=True))
