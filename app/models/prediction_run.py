from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class PredictionRun(TimestampMixin, Base):
    __tablename__ = 'prediction_runs'
    id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey('races.id'), index=True)
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    selected_variables: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default='completed')
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    race = relationship('Race', back_populates='prediction_runs')
    predictions = relationship('Prediction', back_populates='prediction_run', cascade='all, delete-orphan')
