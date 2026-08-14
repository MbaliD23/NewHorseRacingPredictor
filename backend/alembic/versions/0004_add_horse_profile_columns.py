"""add horse profile columns"""

from alembic import op
import sqlalchemy as sa


revision = "0004_add_horse_profile_columns"
down_revision = "0003_add_race_metadata_columns"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("horses", sa.Column("merit_rating", sa.Integer(), nullable=True))
    op.add_column("horses", sa.Column("pedigree_line", sa.String(length=255), nullable=True))
    op.add_column("horses", sa.Column("breeder", sa.String(length=255), nullable=True))
    op.add_column("horses", sa.Column("owner", sa.String(length=255), nullable=True))
    op.add_column("horses", sa.Column("total_runs", sa.String(length=50), nullable=True))
    op.add_column("horses", sa.Column("wet_record", sa.String(length=50), nullable=True))
    op.add_column("horses", sa.Column("course_record", sa.String(length=50), nullable=True))
    op.add_column("horses", sa.Column("distance_record", sa.String(length=50), nullable=True))
    op.add_column("horses", sa.Column("course_distance_record", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("horses", "course_distance_record")
    op.drop_column("horses", "distance_record")
    op.drop_column("horses", "course_record")
    op.drop_column("horses", "wet_record")
    op.drop_column("horses", "total_runs")
    op.drop_column("horses", "owner")
    op.drop_column("horses", "breeder")
    op.drop_column("horses", "pedigree_line")
    op.drop_column("horses", "merit_rating")
