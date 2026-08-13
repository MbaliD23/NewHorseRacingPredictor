"""add race metadata columns"""

from alembic import op
import sqlalchemy as sa


revision = "0003_add_race_metadata_columns"
down_revision = "288780da9e6d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("races", sa.Column("conditions", sa.String(length=300), nullable=True))
    op.add_column("races", sa.Column("course", sa.String(length=20), nullable=True))
    op.add_column("races", sa.Column("course_record", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("races", "course_record")
    op.drop_column("races", "course")
    op.drop_column("races", "conditions")
