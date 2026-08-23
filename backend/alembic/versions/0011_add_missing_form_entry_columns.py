"""add missing form entry columns

Revision ID: 0011_add_missing_form_entry_columns
Revises: 0010_add_extended_form_entry_columns
Create Date: 2026-08-23
"""

from alembic import op
import sqlalchemy as sa


revision = "0011_add_missing_form_entry_columns"
down_revision = "0010_add_extended_form_entry_columns"
branch_labels = None
depends_on = None


def _form_entry_columns() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns("horse_form_entries")}


def upgrade() -> None:
    existing_columns = _form_entry_columns()

    if "going" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("going", sa.String(length=20), nullable=True))
    if "race_class" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("race_class", sa.String(length=50), nullable=True))
    if "starting_price" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("starting_price", sa.String(length=30), nullable=True))
    if "merit_rating" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("merit_rating", sa.String(length=30), nullable=True))


def downgrade() -> None:
    existing_columns = _form_entry_columns()

    if "merit_rating" in existing_columns:
        op.drop_column("horse_form_entries", "merit_rating")
    if "starting_price" in existing_columns:
        op.drop_column("horse_form_entries", "starting_price")
    if "race_class" in existing_columns:
        op.drop_column("horse_form_entries", "race_class")
    if "going" in existing_columns:
        op.drop_column("horse_form_entries", "going")
