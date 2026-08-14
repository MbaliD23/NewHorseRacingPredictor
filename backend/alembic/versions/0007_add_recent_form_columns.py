"""add recent form columns"""

from alembic import op
import sqlalchemy as sa


revision = "0007_add_recent_form_columns"
down_revision = "0006_add_horse_form_entries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "horse_form_entries",
        sa.Column("race_number", sa.String(length=30), nullable=True),
    )
    op.add_column(
        "horse_form_entries",
        sa.Column("winner_weight", sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("horse_form_entries", "winner_weight")
    op.drop_column("horse_form_entries", "race_number")
