from datetime import date

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class RaceMeeting(TimestampMixin, Base):
    __tablename__ = 'race_meetings'
    id: Mapped[int] = mapped_column(primary_key=True)
    venue: Mapped[str] = mapped_column(String(255), index=True)
    meeting_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    external_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    races = relationship('Race', back_populates='meeting', cascade='all, delete-orphan')
