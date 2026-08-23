"""add course_desc and weeks to form entries

Revision ID: 0012_add_course_desc_and_weeks
Revises: 0011_add_missing_form_entry_columns
Create Date: 2026-08-23
"""

from alembic import op
import sqlalchemy as sa


revision = "0012_add_course_desc_and_weeks"
down_revision = "0011_add_missing_form_entry_columns"
branch_labels = None
depends_on = None


def _form_entry_columns() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns("horse_form_entries")}


def upgrade() -> None:
    existing_columns = _form_entry_columns()

    if "weeks" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("weeks", sa.String(length=20), nullable=True))
    if "course_desc" not in existing_columns:
        op.add_column("horse_form_entries", sa.Column("course_desc", sa.String(length=20), nullable=True))


def downgrade() -> None:
    existing_columns = _form_entry_columns()

    if "course_desc" in existing_columns:
        op.drop_column("horse_form_entries", "course_desc")
    if "weeks" in existing_columns:
        op.drop_column("horse_form_entries", "weeks")
