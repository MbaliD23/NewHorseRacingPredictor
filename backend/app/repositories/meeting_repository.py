from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.race_meeting import RaceMeeting
from app.repositories.base import BaseRepository


class MeetingRepository(BaseRepository):
    async def list_meetings(self) -> list[RaceMeeting]:
        result = await self.session.execute(
            select(RaceMeeting).options(selectinload(RaceMeeting.races)).order_by(RaceMeeting.meeting_date, RaceMeeting.venue)
        )
        return list(result.scalars().unique().all())
