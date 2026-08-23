from datetime import datetime

from app.repositories.race_repository import RaceRepository
from app.schemas.race import HorseFormEntryView, HorseView, RaceCardView, RaceView, VenueView


class RaceService:
    def __init__(self, session):
        self.session = session
        self.race_repo = RaceRepository(session)

    @staticmethod
    def _sort_horses_by_runner_number(horses):
        return sorted(
            horses,
            key=lambda horse: (
                horse.runner_number is None,
                horse.runner_number if horse.runner_number is not None else 999,
                horse.name,
            ),
        )

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
            runner_number=horse.runner_number,
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
            jockey_record=horse.jockey_record,
            trainer_record=horse.trainer_record,
            jockey_perf=horse.jockey_record,
            trainer_perf=horse.trainer_record,
            speed_index=float(horse.speed_index)
            if horse.speed_index is not None
            else None,
            predicted_time=float(horse.predicted_time)
            if horse.predicted_time is not None
            else None,
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
            form_entries=[
                HorseFormEntryView(
                    run_date=entry.run_date.isoformat() if entry.run_date else None,
                    raw_date_text=entry.raw_date_text,
                    weeks=getattr(entry, "weeks", None),
                    track=entry.track,
                    going=getattr(entry, "going", None),
                    track_condition=getattr(entry, "going", None),
                    race_class=getattr(entry, "race_class", None),
                    class_of_race=getattr(entry, "race_class", None),
                    course_desc=getattr(entry, "course_desc", None),
                    c_desc=getattr(entry, "course_desc", None),
                    ref_no=entry.ref_no,
                    race_number=entry.race_number,
                    distance=entry.distance,
                    jockey_name=entry.jockey_name,
                    weight=entry.weight,
                    shoeing=entry.shoeing,
                    draw=entry.draw,
                    finish_position=entry.finish_position,
                    margin_behind_winner=entry.margin_behind_winner,
                    winner_name=entry.winner_name,
                    winner_weight=entry.winner_weight,
                    time=entry.time,
                    adjusted_time=entry.adjusted_time,
                    opening_bet=entry.opening_bet,
                    open_odds=entry.opening_bet,
                    odds=entry.odds,
                    starting_price=getattr(entry, "starting_price", None) or entry.odds,
                    sp=getattr(entry, "starting_price", None) or entry.odds,
                    actual_rating=entry.actual_rating,
                    pts=entry.actual_rating or entry.rating,
                    merit_rating=getattr(entry, "merit_rating", None) or entry.actual_rating or entry.rating,
                    mr=getattr(entry, "merit_rating", None) or entry.actual_rating or entry.rating,
                    comment=entry.comment,
                    speed_figure=entry.speed_figure,
                    rating=entry.rating,
                    form_summary=entry.form_summary,
                )
                for entry in sorted(
                    horse.form_entries,
                    key=lambda item: (
                        item.run_date is None,
                        item.run_date.isoformat() if item.run_date else "",
                    ),
                    reverse=True,
                )
            ],
        )

    async def list_venues(self) -> list[VenueView]:
        meetings = await self.race_repo.list_meetings()
        payload = []
        fallback_payload = []

        for meeting in meetings:
            current_races = []
            all_races = []
            for race in sorted(meeting.races, key=lambda item: item.race_number):
                race_view = self._race_card_view(race)
                all_races.append(race_view)
                if not race_view.is_past:
                    current_races.append(race_view)

            if not all_races:
                continue

            venue_view = VenueView(
                id=meeting.id,
                venue=meeting.venue,
                meeting_date=meeting.meeting_date.isoformat()
                if meeting.meeting_date
                else None,
                races=current_races,
            )

            if current_races:
                payload.append(venue_view)

            fallback_payload.append(
                VenueView(
                    id=meeting.id,
                    venue=meeting.venue,
                    meeting_date=meeting.meeting_date.isoformat()
                    if meeting.meeting_date
                    else None,
                    races=all_races,
                )
            )

        if payload:
            return payload

        if not fallback_payload:
            return []

        latest_meeting_date = max(
            (meeting.meeting_date for meeting in meetings if meeting.meeting_date),
            default=None,
        )
        if latest_meeting_date is None:
            return fallback_payload

        return [
            venue
            for venue in fallback_payload
            if venue.meeting_date == latest_meeting_date.isoformat()
        ]

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
            if not race_view.is_past:
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
            horses=[
                self._horse_view(horse)
                for horse in self._sort_horses_by_runner_number(race.horses)
            ],
        )

    async def get_horse_view(self, horse_id: int) -> HorseView | None:
        horse = await self.race_repo.get_horse(horse_id)
        if not horse:
            return None

        return self._horse_view(horse)

    async def list_meetings_grouped(self) -> list[VenueView]:
        return await self.list_venues()
