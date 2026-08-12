from datetime import datetime

from app.repositories.race_repository import RaceRepository
from app.schemas.race import HorseView, RaceCardView, RaceView, VenueView


class RaceService:
    def __init__(self, session):
        self.session = session
        self.race_repo = RaceRepository(session)

    @staticmethod
    def _race_flags(race_time):
        if not race_time:
            return False, False, False
        now = datetime.now(race_time.tzinfo) if race_time.tzinfo else datetime.now()
        is_past = race_time < now
        is_live = race_time.hour == now.hour and race_time.date() == now.date()
        is_upcoming = race_time >= now
        return is_live and not is_past, is_upcoming, is_past

    def _race_card_view(self, race) -> RaceCardView:
        is_live, is_upcoming, is_past = self._race_flags(race.race_time)
        return RaceCardView(
            id=race.id,
            race_number=race.race_number,
            race_time=race.race_time,
            distance=race.distance,
            surface=race.surface,
            field_size=race.field_size,
            status=race.status,
            title=race.title,
            runners=len(race.horses),
            is_live=is_live,
            is_upcoming=is_upcoming,
            is_past=is_past,
        )

    def _horse_view(self, horse) -> HorseView:
        return HorseView(
            id=horse.id,
            race_id=horse.race_id,
            name=horse.name,
            trainer_name=horse.trainer.name if horse.trainer else None,
            jockey_name=horse.jockey.name if horse.jockey else None,
            draw_number=horse.draw_number,
            weight_value=float(horse.weight_value)
            if horse.weight_value is not None
            else None,
            previous_run_rating=float(horse.previous_run_rating)
            if horse.previous_run_rating is not None
            else None,
            trainer_jockey_win_percent=float(horse.trainer_jockey_win_percent)
            if horse.trainer_jockey_win_percent is not None
            else None,
            speed_index=float(horse.speed_index)
            if horse.speed_index is not None
            else None,
            predicted_time=float(horse.predicted_time)
            if horse.predicted_time is not None
            else None,
            scratched=horse.scratched,
            status=horse.status,
            notes=horse.notes,
        )

    async def list_venues(self) -> list[VenueView]:
        meetings = await self.race_repo.list_meetings()
        payload = []

        for meeting in meetings:
            races = []
            for race in sorted(meeting.races, key=lambda item: item.race_number):
                race_view = self._race_card_view(race)
                races.append(race_view)

            if not races:
                continue

            payload.append(
                VenueView(
                    id=meeting.id,
                    venue=meeting.venue,
                    meeting_date=meeting.meeting_date.isoformat()
                    if meeting.meeting_date
                    else None,
                    races=races,
                )
            )

        return payload

    async def list_archived_venues(self) -> list[VenueView]:
        meetings = await self.race_repo.list_meetings()
        payload = []

        for meeting in meetings:
            races = []
            for race in sorted(meeting.races, key=lambda item: item.race_number):
                race_view = self._race_card_view(race)
                if race_view.is_past:
                    races.append(race_view)

            if not races:
                continue

            payload.append(
                VenueView(
                    id=meeting.id,
                    venue=meeting.venue,
                    meeting_date=meeting.meeting_date.isoformat()
                    if meeting.meeting_date
                    else None,
                    races=races,
                )
            )

        return payload

    async def get_venue(self, meeting_id: int) -> VenueView | None:
        meeting = await self.race_repo.get_meeting(meeting_id)
        if not meeting:
            return None

        races = []
        for race in sorted(meeting.races, key=lambda item: item.race_number):
            race_view = self._race_card_view(race)
            races.append(race_view)

        return VenueView(
            id=meeting.id,
            venue=meeting.venue,
            meeting_date=meeting.meeting_date.isoformat()
            if meeting.meeting_date
            else None,
            races=races,
        )

    async def get_race_view(self, race_id: int) -> RaceView | None:
        race = await self.race_repo.get_race(race_id)
        if not race:
            return None

        return RaceView(
            id=race.id,
            meeting_id=race.meeting.id,
            venue=race.meeting.venue,
            meeting_date=race.meeting.meeting_date.isoformat()
            if race.meeting.meeting_date
            else None,
            race_number=race.race_number,
            race_time=race.race_time,
            distance=race.distance,
            surface=race.surface,
            field_size=race.field_size,
            status=race.status,
            title=race.title,
            horses=[self._horse_view(horse) for horse in race.horses],
        )

    async def get_horse_view(self, horse_id: int) -> HorseView | None:
        horse = await self.race_repo.get_horse(horse_id)
        if not horse:
            return None

        return self._horse_view(horse)

    async def list_meetings_grouped(self) -> list[VenueView]:
        return await self.list_venues()
