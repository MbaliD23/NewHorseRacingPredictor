"""add horse runner number"""

from alembic import op
import sqlalchemy as sa


revision = "0005_add_horse_runner_number"
down_revision = "0004_add_horse_profile_columns"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("horses", sa.Column("runner_number", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("horses", "runner_number")
