from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class Trainer(TimestampMixin, Base):
    __tablename__ = 'trainers'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    ranking: Mapped[float | None] = mapped_column(nullable=True)
    horses = relationship('Horse', back_populates='trainer')
