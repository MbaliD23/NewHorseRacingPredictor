from datetime import datetime

from pydantic import BaseModel


class HorseView(BaseModel):
    id: int
    race_id: int
    name: str
    trainer_name: str | None = None
    trainer_ranking: float | None = None
    jockey_name: str | None = None
    jockey_rating: float | None = None
    draw_number: int | None = None
    weight_value: float | None = None
    starting_price: float | None = None
    previous_run_rating: float | None = None
    scratched: bool
    status: str | None = None
    notes: str | None = None


class RaceCardView(BaseModel):
    id: int
    race_number: int
    race_time: datetime | None = None
    distance: str | None = None
    surface: str | None = None
    field_size: int | None = None
    status: str | None = None
    title: str | None = None
    runners: int = 0
    is_live: bool = False
    is_upcoming: bool = False


class VenueView(BaseModel):
    id: int
    venue: str
    meeting_date: str | None = None
    races: list[RaceCardView]


class RaceView(BaseModel):
    id: int
    meeting_id: int
    venue: str
    meeting_date: str | None = None
    race_number: int
    race_time: datetime | None = None
    distance: str | None = None
    surface: str | None = None
    field_size: int | None = None
    status: str | None = None
    title: str | None = None
    horses: list[HorseView]