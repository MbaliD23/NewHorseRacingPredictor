"""add team record columns"""

from alembic import op
import sqlalchemy as sa


revision = "0009_add_team_record_columns"
down_revision = "0008_add_trainer_jockey_combo_columns"
branch_labels = None
depends_on = None


def _horse_columns() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns("horses")}


def upgrade() -> None:
    existing_columns = _horse_columns()

    if "jockey_record" not in existing_columns:
        op.add_column("horses", sa.Column("jockey_record", sa.String(length=50), nullable=True))
    if "trainer_record" not in existing_columns:
        op.add_column("horses", sa.Column("trainer_record", sa.String(length=50), nullable=True))


def downgrade() -> None:
    existing_columns = _horse_columns()

    if "trainer_record" in existing_columns:
        op.drop_column("horses", "trainer_record")
    if "jockey_record" in existing_columns:
        op.drop_column("horses", "jockey_record")
