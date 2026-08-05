from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.repositories.race_repository import RaceRepository
from app.services.monitoring_state import monitoring_state
from app.services.prediction_service import PredictionService
from app.services.scrape_service import ScrapeService

logger = get_logger(__name__)


class MonitoringService:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler(timezone="Africa/Johannesburg")

    async def start(self) -> None:
        if self.scheduler.running:
            return

        self.scheduler.add_job(
            self.run_cycle,
            CronTrigger(hour="0,6,12,18", minute=0),
            id="monitoring-job",
            replace_existing=True,
        )

        self.scheduler.start()
        monitoring_state.active = True
        await self.run_cycle()

    async def stop(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
        monitoring_state.active = False

    async def run_cycle(self) -> None:
        logger.info("monitoring_cycle_started")
        async with SessionLocal() as session:
            scrape_service = ScrapeService(session)
            result = await scrape_service.sync()

        if result["changes_detected"]:
            async with SessionLocal() as session:
                race_repo = RaceRepository(session)
                prediction_service = PredictionService(session)
                races = await race_repo.list_races()
                for race in races:
                    active_horses = [horse for horse in race.horses if not horse.scratched]
                    if len(active_horses) >= 3:
                        try:
                            await prediction_service.run_prediction(
                                race.id,
                                ["trainer_ranking", "jockey_rating", "starting_price"],
                            )
                        except Exception as exc:
                            logger.exception("prediction_cycle_failed %s", exc)

        logger.info("monitoring_cycle_completed")