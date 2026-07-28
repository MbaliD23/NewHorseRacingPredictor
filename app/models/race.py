from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class Race(TimestampMixin, Base):
    __tablename__ = 'races'

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey('race_meetings.id'), index=True)
    race_number: Mapped[int] = mapped_column(Integer, index=True)
    external_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source_url: Mapped[str] = mapped_column(String(500))
    race_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    distance: Mapped[str | None] = mapped_column(String(100), nullable=True)
    surface: Mapped[str | None] = mapped_column(String(100), nullable=True)
    field_size: Mapped[int | None] = mapped_column(nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # --- new columns ---
    conditions: Mapped[str | None] = mapped_column(String(300), nullable=True)
    course: Mapped[str | None] = mapped_column(String(20), nullable=True)
    course_record: Mapped[str | None] = mapped_column(String(120), nullable=True)

    meeting = relationship('RaceMeeting', back_populates='races')
    horses = relationship('Horse', back_populates='race', cascade='all, delete-orphan')
    prediction_runs = relationship('PredictionRun', back_populates='race', cascade='all, delete-orphan')