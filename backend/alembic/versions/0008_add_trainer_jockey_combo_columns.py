"""add trainer jockey combo columns"""

from alembic import op
import sqlalchemy as sa


revision = "0008_add_trainer_jockey_combo_columns"
down_revision = "0007_add_recent_form_columns"
branch_labels = None
depends_on = None


def _horse_columns() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns("horses")}


def upgrade() -> None:
    existing_columns = _horse_columns()

    if "trainer_jockey_runs" not in existing_columns:
        op.add_column(
            "horses",
            sa.Column("trainer_jockey_runs", sa.Integer(), nullable=True),
        )
    if "trainer_jockey_wins" not in existing_columns:
        op.add_column(
            "horses",
            sa.Column("trainer_jockey_wins", sa.Integer(), nullable=True),
        )
    if "trainer_jockey_seconds" not in existing_columns:
        op.add_column(
            "horses",
            sa.Column("trainer_jockey_seconds", sa.Integer(), nullable=True),
        )
    if "trainer_jockey_thirds" not in existing_columns:
        op.add_column(
            "horses",
            sa.Column("trainer_jockey_thirds", sa.Integer(), nullable=True),
        )
    if "trainer_jockey_place_percent" not in existing_columns:
        op.add_column(
            "horses",
            sa.Column("trainer_jockey_place_percent", sa.Numeric(10, 2), nullable=True),
        )


def downgrade() -> None:
    existing_columns = _horse_columns()

    if "trainer_jockey_place_percent" in existing_columns:
        op.drop_column("horses", "trainer_jockey_place_percent")
    if "trainer_jockey_thirds" in existing_columns:
        op.drop_column("horses", "trainer_jockey_thirds")
    if "trainer_jockey_seconds" in existing_columns:
        op.drop_column("horses", "trainer_jockey_seconds")
    if "trainer_jockey_wins" in existing_columns:
        op.drop_column("horses", "trainer_jockey_wins")
    if "trainer_jockey_runs" in existing_columns:
        op.drop_column("horses", "trainer_jockey_runs")
