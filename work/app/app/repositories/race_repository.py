from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.horse import Horse
from app.models.prediction import Prediction
from app.models.prediction_run import PredictionRun
from app.models.race import Race
from app.models.race_meeting import RaceMeeting
from app.repositories.base import BaseRepository


class RaceRepository(BaseRepository):
    async def list_races(self) -> list[Race]:
        result = await self.session.execute(
            select(Race)
            .options(
                selectinload(Race.meeting),
                selectinload(Race.horses).selectinload(Horse.trainer),
                selectinload(Race.horses).selectinload(Horse.jockey),
            )
            .order_by(Race.race_time)
        )
        return list(result.scalars().unique().all())

    async def list_meetings(self) -> list[RaceMeeting]:
        result = await self.session.execute(
            select(RaceMeeting)
            .options(
                selectinload(RaceMeeting.races).selectinload(Race.horses)
            )
            .order_by(RaceMeeting.meeting_date.desc(), RaceMeeting.venue.asc())
        )
        return list(result.scalars().unique().all())

    async def get_meeting(self, meeting_id: int) -> RaceMeeting | None:
        result = await self.session.execute(
            select(RaceMeeting)
            .where(RaceMeeting.id == meeting_id)
            .options(
                selectinload(RaceMeeting.races).selectinload(Race.horses)
            )
        )
        return result.scalars().unique().first()

    async def get_race(self, race_id: int) -> Race | None:
        result = await self.session.execute(
            select(Race)
            .where(Race.id == race_id)
            .options(
                selectinload(Race.meeting),
                selectinload(Race.horses).selectinload(Horse.trainer),
                selectinload(Race.horses).selectinload(Horse.jockey),
                selectinload(Race.prediction_runs)
                .selectinload(PredictionRun.predictions)
                .selectinload(Prediction.horse),
            )
        )
        return result.scalars().unique().first()

    async def get_horse(self, horse_id: int) -> Horse | None:
        result = await self.session.execute(
            select(Horse)
            .where(Horse.id == horse_id)
            .options(
                selectinload(Horse.race).selectinload(Race.meeting),
                selectinload(Horse.trainer),
                selectinload(Horse.jockey),
            )
        )
        return result.scalars().unique().first()