from alembic import op
import sqlalchemy as sa


revision = "0002_prediction_variable_replacement"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "horses",
        sa.Column("trainer_jockey_win_percent", sa.Numeric(10, 2), nullable=True),
    )
    op.add_column("horses", sa.Column("speed_index", sa.Numeric(10, 2), nullable=True))
    op.add_column("horses", sa.Column("predicted_time", sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("horses", "predicted_time")
    op.drop_column("horses", "speed_index")
    op.drop_column("horses", "trainer_jockey_win_percent")
