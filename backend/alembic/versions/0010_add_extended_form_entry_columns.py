"""add extended form entry columns

Revision ID: 0010_add_extended_form_entry_columns
Revises: 0009_add_team_record_columns
Create Date: 2026-08-21
"""

from alembic import op
import sqlalchemy as sa


revision = "0010_add_extended_form_entry_columns"
down_revision = "0009_add_team_record_columns"
branch_labels = None
depends_on = None


def _form_entry_columns() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns("horse_form_entries")}


def upgrade() -> None:
    existing_columns = _form_entry_columns()

    if "ref_no" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("ref_no", sa.String(length=30), nullable=True))
    if "shoeing" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("shoeing", sa.String(length=20), nullable=True))
    if "time" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("time", sa.String(length=30), nullable=True))
    if "adjusted_time" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("adjusted_time", sa.String(length=30), nullable=True))
    if "opening_bet" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("opening_bet", sa.String(length=30), nullable=True))
    if "actual_rating" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("actual_rating", sa.String(length=30), nullable=True))


def downgrade() -> None:
    existing_columns = _form_entry_columns()

    if "actual_rating" in existing_columns:
        op.drop_column("horse_form_entries", "actual_rating")
    if "opening_bet" in existing_columns:
        op.drop_column("horse_form_entries", "opening_bet")
    if "adjusted_time" in existing_columns:
        op.drop_column("horse_form_entries", "adjusted_time")
    if "time" in existing_columns:
        op.drop_column("horse_form_entries", "time")
    if "shoeing" in existing_columns:
        op.drop_column("horse_form_entries", "shoeing")
    if "ref_no" in existing_columns:
        op.drop_column("horse_form_entries", "ref_no")
