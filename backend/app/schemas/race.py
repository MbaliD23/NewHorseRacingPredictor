from datetime import datetime

from pydantic import BaseModel, Field


class HorseFormEntryView(BaseModel):
    run_date: str | None = None
    raw_date_text: str | None = None
    track: str | None = None
    race_number: str | None = None
    distance: str | None = None
    jockey_name: str | None = None
    weight: str | None = None
    draw: str | None = None
    finish_position: int | None = None
    margin_behind_winner: str | None = None
    winner_name: str | None = None
    winner_weight: str | None = None
    odds: str | None = None
    comment: str | None = None
    speed_figure: str | None = None
    rating: str | None = None
    form_summary: str | None = None


class HorseView(BaseModel):
    id: int
    race_id: int
    name: str
    runner_number: int | None = None
    trainer_name: str | None = None
    jockey_name: str | None = None
    draw_number: int | None = None
    weight_value: float | None = None
    previous_run_rating: float | None = None
    trainer_jockey_win_percent: float | None = None
    speed_index: float | None = None
    predicted_time: float | None = None
    scratched: bool
    status: str | None = None
    notes: str | None = None
    odds: str | None = None
    equipment: str | None = None
    merit_rating: int | None = None
    pedigree_description: str | None = None
    pedigree_line: str | None = None
    dob: str | None = None
    silks: str | None = None
    breeder: str | None = None
    owner: str | None = None
    total_runs: str | None = None
    wet_record: str | None = None
    course_record: str | None = None
    distance_record: str | None = None
    course_distance_record: str | None = None
    stakes: str | None = None
    sale_price: str | None = None
    form_entries: list[HorseFormEntryView] = Field(default_factory=list)


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
    is_past: bool = False


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
