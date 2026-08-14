from sqlalchemy import select

from app.models.horse import Horse
from app.models.horse_form_entry import HorseFormEntry
from app.models.jockey import Jockey
from app.models.race import Race
from app.models.race_meeting import RaceMeeting
from app.models.trainer import Trainer
from app.models.variable import Variable
from app.repositories.base import BaseRepository

# Fields that must always reflect the latest read, even when the new value
# is None. Without this, bad values from earlier runs are never corrected.
RACE_OVERWRITE_FIELDS = {
    "race_number",
    "source_url",
    "race_time",
    "distance",
    "surface",
    "field_size",
    "status",
    "title",
    "conditions",
    "course",
    "course_record",
}

HORSE_OVERWRITE_FIELDS = {
    "name",
    "runner_number",
    "draw_number",
    "weight_value",
    "previous_run_rating",
    "trainer_jockey_win_percent",
    "speed_index",
    "predicted_time",
    "scratched",
    "status",
    "notes",
    "odds",
    "equipment",
    "merit_rating",
    "pedigree_description",
    "pedigree_line",
    "dob",
    "silks",
    "breeder",
    "owner",
    "total_runs",
    "wet_record",
    "course_record",
    "distance_record",
    "course_distance_record",
    "stakes",
    "sale_price",
}

# Never null these out on a re-run — a missing lookup should keep the old link.
PRESERVE_IF_NONE = {"trainer_id", "jockey_id", "meeting_id", "race_id"}


class UpsertRepository(BaseRepository):
    async def get_or_create_trainer(
        self,
        name: str,
        ranking: float | None = None,
    ) -> Trainer:
        result = await self.session.execute(select(Trainer).where(Trainer.name == name))
        entity = result.scalars().first()
        if entity:
            if ranking is not None:
                entity.ranking = ranking
            return entity

        entity = Trainer(name=name, ranking=ranking)
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def get_or_create_jockey(
        self,
        name: str,
        rating: float | None = None,
    ) -> Jockey:
        result = await self.session.execute(select(Jockey).where(Jockey.name == name))
        entity = result.scalars().first()
        if entity:
            if rating is not None:
                entity.rating = rating
            return entity

        entity = Jockey(name=name, rating=rating)
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def get_or_create_meeting(
        self,
        external_id: str,
        venue: str,
        meeting_date=None,
        source_url: str | None = None,
    ) -> RaceMeeting:
        result = await self.session.execute(
            select(RaceMeeting).where(RaceMeeting.external_id == external_id)
        )
        entity = result.scalars().first()

        if entity:
            # Always refresh so a corrected venue name replaces an old wrong one.
            entity.venue = venue
            entity.meeting_date = meeting_date
            entity.source_url = source_url
            return entity

        entity = RaceMeeting(
            external_id=external_id,
            venue=venue,
            meeting_date=meeting_date,
            source_url=source_url,
        )
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def get_or_create_race(
        self,
        external_id: str,
        meeting_id: int,
        **kwargs,
    ) -> Race:
        result = await self.session.execute(
            select(Race).where(Race.external_id == external_id)
        )
        entity = result.scalars().first()

        if entity:
            for key, value in kwargs.items():
                if key in RACE_OVERWRITE_FIELDS:
                    setattr(entity, key, value)
                elif value is not None and key not in PRESERVE_IF_NONE:
                    setattr(entity, key, value)
            entity.meeting_id = meeting_id
            await self.session.flush()
            return entity

        entity = Race(external_id=external_id, meeting_id=meeting_id, **kwargs)
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def upsert_horse(
        self,
        external_id: str,
        race_id: int,
        **kwargs,
    ) -> Horse:
        result = await self.session.execute(
            select(Horse).where(
                Horse.external_id == external_id,
                Horse.race_id == race_id,
            )
        )
        entity = result.scalars().first()

        if entity:
            for key, value in kwargs.items():
                if key in PRESERVE_IF_NONE and value is None:
                    continue
                if key in HORSE_OVERWRITE_FIELDS or value is not None:
                    setattr(entity, key, value)
            entity.race_id = race_id
            await self.session.flush()
            return entity

        entity = Horse(external_id=external_id, race_id=race_id, **kwargs)
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete_orphan_horses(self, race_id: int, keep_external_ids: set[str]) -> int:
        """Remove horses previously stored for a race that no longer appear.

        Call this after upserting a race's runners so stale junk rows from
        earlier parser versions disappear instead of inflating the field.
        """
        result = await self.session.execute(select(Horse).where(Horse.race_id == race_id))
        removed = 0
        for horse in result.scalars().all():
            if horse.external_id not in keep_external_ids:
                await self.session.delete(horse)
                removed += 1
        if removed:
            await self.session.flush()
        return removed

    async def replace_horse_form_entries(self, horse_id: int, entries: list[dict]) -> None:
        result = await self.session.execute(select(HorseFormEntry).where(HorseFormEntry.horse_id == horse_id))
        for entry in result.scalars().all():
            await self.session.delete(entry)

        for entry in entries:
            self.session.add(HorseFormEntry(horse_id=horse_id, **entry))

        await self.session.flush()

    async def ensure_variables(self, variables: list[tuple[str, str]]) -> None:
        for code, display_name in variables:
            result = await self.session.execute(
                select(Variable).where(Variable.code == code)
            )
            entity = result.scalars().first()
            if not entity:
                self.session.add(Variable(code=code, display_name=display_name))
        await self.session.flush()
