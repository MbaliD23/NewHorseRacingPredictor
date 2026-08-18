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
    runner_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    draw_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_value: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    previous_run_rating: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    trainer_jockey_win_percent: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    jockey_record: Mapped[str | None] = mapped_column(String(50), nullable=True)
    trainer_record: Mapped[str | None] = mapped_column(String(50), nullable=True)
    speed_index: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    predicted_time: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    scratched: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    odds: Mapped[str | None] = mapped_column(String(50), nullable=True)
    equipment: Mapped[str | None] = mapped_column(String(50), nullable=True)
    merit_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pedigree_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pedigree_line: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dob: Mapped[str | None] = mapped_column(String(50), nullable=True)
    silks: Mapped[str | None] = mapped_column(String(255), nullable=True)
    breeder: Mapped[str | None] = mapped_column(String(255), nullable=True)
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    total_runs: Mapped[str | None] = mapped_column(String(50), nullable=True)
    wet_record: Mapped[str | None] = mapped_column(String(50), nullable=True)
    course_record: Mapped[str | None] = mapped_column(String(50), nullable=True)
    distance_record: Mapped[str | None] = mapped_column(String(50), nullable=True)
    course_distance_record: Mapped[str | None] = mapped_column(String(50), nullable=True)
    stakes: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sale_price: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    race = relationship('Race', back_populates='horses')
    trainer = relationship('Trainer', back_populates='horses')
    jockey = relationship('Jockey', back_populates='horses')
    form_entries = relationship('HorseFormEntry', back_populates='horse', cascade='all, delete-orphan')
    scores = relationship('Score', back_populates='horse', cascade='all, delete-orphan')
    predictions = relationship('Prediction', back_populates='horse', cascade='all, delete-orphan')
