from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.log_entry import LogEntry
from app.repositories.log_repository import LogRepository

logger = get_logger(__name__)


class LogService:
    def __init__(self, session: AsyncSession):
        self.repo = LogRepository(session)
        self.session = session

    async def write(self, level: str, category: str, message: str, details: str | None = None) -> None:
        logger.log(getattr(__import__('logging'), level.upper(), 20), '%s | %s', category, message)
        await self.repo.add(LogEntry(level=level.upper(), category=category, message=message, details=details))
