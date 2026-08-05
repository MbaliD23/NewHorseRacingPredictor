from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.prediction_run import PredictionRun
from app.repositories.scrape_repository import ScrapeHistoryRepository
from app.schemas.prediction import StatusResponse
from sqlalchemy import select

from app.services.monitoring_state import monitoring_state


class StatusService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.scrape_repo = ScrapeHistoryRepository(session)
        self.settings = get_settings()

    async def get_status(self) -> StatusResponse:
        latest_scrape = await self.scrape_repo.latest()
        latest_prediction = (await self.session.execute(select(PredictionRun).order_by(PredictionRun.run_at.desc()))).scalars().first()
        return StatusResponse(
            app_name=self.settings.app_name,
            last_scrape_at=latest_scrape.created_at if latest_scrape else None,
            last_prediction_at=latest_prediction.run_at if latest_prediction else None,
            last_change_detected_at=latest_scrape.created_at if latest_scrape and latest_scrape.changes_detected else None,
            monitoring_active=monitoring_state.active,
            source_url=self.settings.website_url,
        )
