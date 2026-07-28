from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class Horse(TimestampMixin, Base):
    __tablename__ = 'horses'
    id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey('races.id'), index=True)
    trainer_id: Mapped[int | None] = mapped_column(ForeignKey('trainers.id'), nullable=True)
    jockey_id: Mapped[int | None] = mapped_column(ForeignKey('jockeys.id'), nullable=True)
    external_id: Mapped[str] = mapped_column(String(255), index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    draw_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_value: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    starting_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    previous_run_rating: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    scratched: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    race = relationship('Race', back_populates='horses')
    trainer = relationship('Trainer', back_populates='horses')
    jockey = relationship('Jockey', back_populates='horses')
    scores = relationship('Score', back_populates='horse', cascade='all, delete-orphan')
    predictions = relationship('Prediction', back_populates='horse', cascade='all, delete-orphan')
