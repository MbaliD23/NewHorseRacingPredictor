from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base_mixins import TimestampMixin


class ScrapeHistory(TimestampMixin, Base):
    __tablename__ = 'scrape_history'
    id: Mapped[int] = mapped_column(primary_key=True)
    source_url: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(50), index=True)
    changes_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    checksum: Mapped[str | None] = mapped_column(String(64), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
