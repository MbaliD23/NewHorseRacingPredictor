from sqlalchemy import select

from app.models.scrape_history import ScrapeHistory
from app.repositories.base import BaseRepository


class ScrapeHistoryRepository(BaseRepository):
    async def add(self, history: ScrapeHistory) -> ScrapeHistory:
        self.session.add(history)
        await self.session.flush()
        return history

    async def latest(self) -> ScrapeHistory | None:
        result = await self.session.execute(select(ScrapeHistory).order_by(ScrapeHistory.created_at.desc()))
        return result.scalars().first()
