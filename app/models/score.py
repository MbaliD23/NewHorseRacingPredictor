from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class Score(TimestampMixin, Base):
    __tablename__ = 'scores'
    id: Mapped[int] = mapped_column(primary_key=True)
    prediction_id: Mapped[int | None] = mapped_column(ForeignKey('predictions.id'), nullable=True, index=True)
    horse_id: Mapped[int] = mapped_column(ForeignKey('horses.id'), index=True)
    variable_id: Mapped[int] = mapped_column(ForeignKey('variables.id'), index=True)
    raw_value: Mapped[float | None] = mapped_column(Numeric(10, 4), nullable=True)
    normalized_score: Mapped[float | None] = mapped_column(Numeric(10, 4), nullable=True)
    weight: Mapped[float] = mapped_column(Numeric(10, 4), default=1.0)
    horse = relationship('Horse', back_populates='scores')
    variable = relationship('Variable', back_populates='scores')
    prediction = relationship('Prediction', back_populates='scores')
