from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class HorseFormEntry(TimestampMixin, Base):
    __tablename__ = "horse_form_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    horse_id: Mapped[int] = mapped_column(ForeignKey("horses.id"), index=True)
    run_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    raw_date_text: Mapped[str | None] = mapped_column(String(30), nullable=True)
    track: Mapped[str | None] = mapped_column(String(30), nullable=True)
    race_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    distance: Mapped[str | None] = mapped_column(String(30), nullable=True)
    jockey_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    weight: Mapped[str | None] = mapped_column(String(20), nullable=True)
    draw: Mapped[str | None] = mapped_column(String(20), nullable=True)
    finish_position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    margin_behind_winner: Mapped[str | None] = mapped_column(String(30), nullable=True)
    winner_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    winner_weight: Mapped[str | None] = mapped_column(String(20), nullable=True)
    odds: Mapped[str | None] = mapped_column(String(30), nullable=True)
    comment: Mapped[str | None] = mapped_column(String(255), nullable=True)
    speed_figure: Mapped[str | None] = mapped_column(String(30), nullable=True)
    rating: Mapped[str | None] = mapped_column(String(30), nullable=True)
    form_summary: Mapped[str | None] = mapped_column(String(500), nullable=True)

    horse = relationship("Horse", back_populates="form_entries")
