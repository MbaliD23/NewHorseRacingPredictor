from app.models.log_entry import LogEntry
from app.repositories.base import BaseRepository


class LogRepository(BaseRepository):
    async def add(self, entry: LogEntry) -> LogEntry:
        self.session.add(entry)
        await self.session.flush()
        return entry
