"""add horse form entries"""

from alembic import op
import sqlalchemy as sa


revision = "0006_add_horse_form_entries"
down_revision = "0005_add_horse_runner_number"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "horse_form_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("horse_id", sa.Integer(), sa.ForeignKey("horses.id"), nullable=False),
        sa.Column("run_date", sa.Date(), nullable=True),
        sa.Column("raw_date_text", sa.String(length=30), nullable=True),
        sa.Column("track", sa.String(length=30), nullable=True),
        sa.Column("race_number", sa.String(length=30), nullable=True),
        sa.Column("distance", sa.String(length=30), nullable=True),
        sa.Column("jockey_name", sa.String(length=120), nullable=True),
        sa.Column("weight", sa.String(length=20), nullable=True),
        sa.Column("draw", sa.String(length=20), nullable=True),
        sa.Column("finish_position", sa.Integer(), nullable=True),
        sa.Column("margin_behind_winner", sa.String(length=30), nullable=True),
        sa.Column("winner_name", sa.String(length=255), nullable=True),
        sa.Column("winner_weight", sa.String(length=20), nullable=True),
        sa.Column("odds", sa.String(length=30), nullable=True),
        sa.Column("comment", sa.String(length=255), nullable=True),
        sa.Column("speed_figure", sa.String(length=30), nullable=True),
        sa.Column("rating", sa.String(length=30), nullable=True),
        sa.Column("form_summary", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )
    op.create_index("ix_horse_form_entries_horse_id", "horse_form_entries", ["horse_id"])


def downgrade() -> None:
    op.drop_index("ix_horse_form_entries_horse_id", table_name="horse_form_entries")
    op.drop_table("horse_form_entries")
