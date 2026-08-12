from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scrape_history import ScrapeHistory
from app.repositories.scrape_repository import ScrapeHistoryRepository
from app.repositories.upsert_repository import UpsertRepository
from app.scrapers.winning_form_scraper import WinningFormScraper
from app.utils.hash_utils import sha256_text

VARIABLES = [
    ("draw_advantage", "Draw Advantage"),
    ("weight", "Weight"),
    ("previous_run", "Previous Run"),
    ("trainer_jockey_win_percent", "Trainer/Jockey Combination Win %"),
    ("speed_index", "Speed Index"),
    ("predicted_time", "Predicted Time"),
]

MAX_RACES = 120


class ScrapeService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.scraper = WinningFormScraper()
        self.scrape_repo = ScrapeHistoryRepository(session)
        self.upsert_repo = UpsertRepository(session)

    async def sync(self) -> dict:
        try:
            await self.upsert_repo.ensure_variables(VARIABLES)

            html, _frames = await self.scraper.fetch_index()
            checksum = sha256_text(html)
            previous = await self.scrape_repo.latest()
            changes_detected = previous.checksum != checksum if previous else True

            race_urls = await self.scraper.scrape_all_race_links()

            races_ingested = 0
            horses_removed = 0
            meetings_seen: set[str] = set()

            for race_url in race_urls[:MAX_RACES]:
                race = await self.scraper.scrape_race_page(race_url)
                if not race:
                    continue

                meeting = await self.upsert_repo.get_or_create_meeting(
                    external_id=race.meeting_external_id,
                    venue=race.venue,
                    meeting_date=race.meeting_date,
                    source_url=race.source_url,
                )
                meetings_seen.add(race.meeting_external_id)

                race_entity = await self.upsert_repo.get_or_create_race(
                    external_id=race.external_id,
                    meeting_id=meeting.id,
                    race_number=race.race_number,
                    source_url=race.source_url,
                    race_time=race.race_time,
                    distance=race.distance,
                    surface=race.surface,
                    field_size=race.field_size,
                    status=race.status,
                    title=race.title,
                    conditions=race.conditions,
                    course=race.course,
                    course_record=race.course_record,
                )

                for horse in race.horses:
                    trainer = None
                    jockey = None

                    if horse.trainer_name:
                        trainer = await self.upsert_repo.get_or_create_trainer(
                            horse.trainer_name,
                        )

                    if horse.jockey_name:
                        jockey = await self.upsert_repo.get_or_create_jockey(
                            horse.jockey_name,
                        )

                    await self.upsert_repo.upsert_horse(
                        external_id=horse.external_id,
                        race_id=race_entity.id,
                        trainer_id=trainer.id if trainer else None,
                        jockey_id=jockey.id if jockey else None,
                        name=horse.name,
                        draw_number=horse.draw_number,
                        weight_value=horse.weight_value,
                        previous_run_rating=horse.previous_run_rating,
                        trainer_jockey_win_percent=horse.trainer_jockey_win_percent,
                        speed_index=horse.speed_index,
                        predicted_time=horse.predicted_time,
                        scratched=horse.scratched,
                        status=horse.status,
                        notes=horse.notes,
                        odds=horse.odds,
                        equipment=horse.equipment,
                        pedigree_description=horse.pedigree_description,
                        dob=horse.dob,
                        silks=horse.silks,
                        stakes=horse.stakes,
                        sale_price=horse.sale_price,
                    )

                horses_removed += await self.upsert_repo.delete_orphan_horses(
                    race_entity.id,
                    {horse.external_id for horse in race.horses},
                )

                races_ingested += 1

            await self.scrape_repo.add(
                ScrapeHistory(
                    source_url="https://legacy.winningform.co.za",
                    status="success",
                    changes_detected=changes_detected,
                    checksum=checksum,
                    details=(
                        f"race_urls_found={len(race_urls)}; "
                        f"meetings_ingested={len(meetings_seen)}; "
                        f"races_ingested={races_ingested}; "
                        f"stale_horses_removed={horses_removed}; "
                        f"checked_at={datetime.now(timezone.utc).isoformat()}"
                    ),
                )
            )

            await self.session.commit()

            return {
                "changes_detected": changes_detected,
                "meetings_ingested": len(meetings_seen),
                "races_ingested": races_ingested,
                "stale_horses_removed": horses_removed,
                "checked_at": datetime.now(timezone.utc),
            }

        finally:
            await self.scraper.close()
