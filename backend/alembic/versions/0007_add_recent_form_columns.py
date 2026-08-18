"""add recent form columns"""

revision = "0007_add_recent_form_columns"
down_revision = "0006_add_horse_form_entries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {
        column["name"] for column in inspector.get_columns("horse_form_entries")
    }

    if "race_number" not in existing_columns:
        op.add_column(
            "horse_form_entries",
            sa.Column("race_number", sa.String(length=30), nullable=True),
        )
    if "winner_weight" not in existing_columns:
        op.add_column(
            "horse_form_entries",
            sa.Column("winner_weight", sa.String(length=20), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {
        column["name"] for column in inspector.get_columns("horse_form_entries")
    }

    if "winner_weight" in existing_columns:
        op.drop_column("horse_form_entries", "winner_weight")
    if "race_number" in existing_columns:
        op.drop_column("horse_form_entries", "race_number")
