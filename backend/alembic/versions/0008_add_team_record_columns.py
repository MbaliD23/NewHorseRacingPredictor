"""add team record columns"""

from alembic import op
import sqlalchemy as sa


revision = "0008_add_team_record_columns"
down_revision = "0007_add_recent_form_columns"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("horses", sa.Column("jockey_record", sa.String(length=50), nullable=True))
    op.add_column("horses", sa.Column("trainer_record", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("horses", "trainer_record")
    op.drop_column("horses", "jockey_record")
