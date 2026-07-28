from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class Prediction(TimestampMixin, Base):
    __tablename__ = 'predictions'
    id: Mapped[int] = mapped_column(primary_key=True)
    prediction_run_id: Mapped[int] = mapped_column(ForeignKey('prediction_runs.id'), index=True)
    horse_id: Mapped[int] = mapped_column(ForeignKey('horses.id'), index=True)
    predicted_position: Mapped[int] = mapped_column(Integer)
    overall_score: Mapped[float] = mapped_column(Numeric(10, 4))
    confidence_percent: Mapped[float] = mapped_column(Numeric(5, 2))
    strongest_metric: Mapped[str | None] = mapped_column(String(100), nullable=True)
    weakest_metric: Mapped[str | None] = mapped_column(String(100), nullable=True)
    key_factors: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    prediction_run = relationship('PredictionRun', back_populates='predictions')
    horse = relationship('Horse', back_populates='predictions')
    scores = relationship('Score', back_populates='prediction', cascade='all, delete-orphan')
