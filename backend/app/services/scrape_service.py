from datetime import date, datetime, timezone
from pathlib import Path

import httpx
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

    async def _upsert_race(self, race) -> tuple[str, int]:
        meeting = await self.upsert_repo.get_or_create_meeting(
            external_id=race.meeting_external_id,
            venue=race.venue,
            meeting_date=race.meeting_date,
            source_url=race.source_url,
        )

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

            horse_entity = await self.upsert_repo.upsert_horse(
                external_id=horse.external_id,
                race_id=race_entity.id,
                trainer_id=trainer.id if trainer else None,
                jockey_id=jockey.id if jockey else None,
                name=horse.name,
                runner_number=horse.runner_number,
                draw_number=horse.draw_number,
                weight_value=horse.weight_value,
                previous_run_rating=horse.previous_run_rating,
                trainer_jockey_win_percent=horse.trainer_jockey_win_percent,
                jockey_record=horse.jockey_record,
                trainer_record=horse.trainer_record,
                speed_index=horse.speed_index,
                predicted_time=horse.predicted_time,
                scratched=horse.scratched,
                status=horse.status,
                notes=horse.notes,
                odds=horse.odds,
                equipment=horse.equipment,
                merit_rating=horse.merit_rating,
                pedigree_description=horse.pedigree_description,
                pedigree_line=horse.pedigree_line,
                dob=horse.dob,
                silks=horse.silks,
                breeder=horse.breeder,
                owner=horse.owner,
                total_runs=horse.total_runs,
                wet_record=horse.wet_record,
                course_record=horse.course_record,
                distance_record=horse.distance_record,
                course_distance_record=horse.course_distance_record,
                stakes=horse.stakes,
                sale_price=horse.sale_price,
            )
            await self.upsert_repo.replace_horse_form_entries(
                horse_entity.id,
                [
                    {
                        "run_date": entry.run_date,
                        "raw_date_text": entry.raw_date_text,
                        "track": entry.track,
                        "ref_no": entry.ref_no,
                        "race_number": entry.race_number,
                        "distance": entry.distance,
                        "jockey_name": entry.jockey_name,
                        "weight": entry.weight,
                        "shoeing": entry.shoeing,
                        "draw": entry.draw,
                        "finish_position": entry.finish_position,
                        "margin_behind_winner": entry.margin_behind_winner,
                        "winner_name": entry.winner_name,
                        "winner_weight": entry.winner_weight,
                        "time": entry.time,
                        "adjusted_time": entry.adjusted_time,
                        "opening_bet": entry.opening_bet,
                        "odds": entry.odds,
                        "actual_rating": entry.actual_rating,
                        "comment": entry.comment,
                        "speed_figure": entry.speed_figure,
                        "rating": entry.rating,
                        "form_summary": entry.form_summary,
                    }
                    for entry in horse.form_entries
                ],
            )

        horses_removed = await self.upsert_repo.delete_orphan_horses(
            race_entity.id,
            {horse.external_id for horse in race.horses},
        )
        return race.meeting_external_id, horses_removed

    async def _sync_sample_race(self, error: Exception) -> dict:
        sample_path = Path(__file__).resolve().parents[2] / "sample_race.html"
        html = sample_path.read_text(encoding="utf-8")
        today = date.today()
        sample_url = (
            "https://legacy.winningform.co.za/KEN/"
            f"2K{today:%y%m%d}_1.htm"
        )
        race = self.scraper.parse_race_html(html, sample_url)
        if not race:
            raise error

        race.meeting_date = today
        if race.race_time:
            race.race_time = race.race_time.replace(
                year=today.year,
                month=today.month,
                day=today.day,
            )
        race.meeting_external_id = f"sample-{today.isoformat()}"
        race.external_id = f"sample-{today:%Y%m%d}-1"
        race.source_url = str(sample_path)

        meeting_external_id, horses_removed = await self._upsert_race(race)
        await self.scrape_repo.add(
            ScrapeHistory(
                source_url=str(sample_path),
                status="fallback",
                changes_detected=True,
                checksum=sha256_text(html),
                details=(
                    f"live_scrape_failed={error!r}; "
                    f"meeting_ingested={meeting_external_id}; "
                    f"races_ingested=1; "
                    f"stale_horses_removed={horses_removed}; "
                    f"checked_at={datetime.now(timezone.utc).isoformat()}"
                ),
            )
        )
        await self.session.commit()
        return {
            "changes_detected": True,
            "meetings_ingested": 1,
            "races_ingested": 1,
            "stale_horses_removed": horses_removed,
            "checked_at": datetime.now(timezone.utc),
        }

    async def sync(self) -> dict:
        try:
            await self.upsert_repo.ensure_variables(VARIABLES)

            try:
                html, _frames = await self.scraper.fetch_index()
            except httpx.HTTPError as exc:
                return await self._sync_sample_race(exc)

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

                meeting_external_id, removed = await self._upsert_race(race)
                meetings_seen.add(meeting_external_id)
                horses_removed += removed
                races_ingested += 1

            if races_ingested == 0:
                return await self._sync_sample_race(
                    RuntimeError(
                        f"live_scrape_returned_no_races; race_urls_found={len(race_urls)}"
                    )
                )

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
