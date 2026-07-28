from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

ALLOWED_VARIABLES = {
    "trainer_ranking",
    "jockey_rating",
    "draw_advantage",
    "weight",
    "starting_price",
    "previous_run",
}

VARIABLE_LABELS = {
    "trainer_ranking": "Trainer Ranking",
    "jockey_rating": "Jockey Rating",
    "draw_advantage": "Draw Advantage",
    "weight": "Weight",
    "starting_price": "Starting Price",
    "previous_run": "Previous Run",
}


class PredictionRequest(BaseModel):
    race_id: int
    selected_variables: list[str] = Field(min_length=3, max_length=3)

    @field_validator("selected_variables")
    @classmethod
    def validate_variables(cls, values: list[str]) -> list[str]:
        normalized = [value.strip() for value in values]
        if len(set(normalized)) != 3:
            raise ValueError("Exactly three distinct variables must be selected.")
        invalid = [value for value in normalized if value not in ALLOWED_VARIABLES]
        if invalid:
            raise ValueError(f"Unsupported variables: {invalid}")
        return normalized


class PredictionItem(BaseModel):
    horse_id: int
    horse_name: str
    predicted_position: Literal[1, 2, 3]
    overall_score: float
    confidence_percent: float
    key_factors: list[str]
    strongest_metric: str | None = None
    weakest_metric: str | None = None
    trainer_name: str | None = None
    jockey_name: str | None = None
    draw_number: int | None = None
    weight_value: float | None = None
    starting_price: float | None = None
    previous_run_rating: float | None = None
    notes: str | None = None


class PredictionResponse(BaseModel):
    race_id: int
    run_at: datetime
    selected_variables: list[str]
    predictions: list[PredictionItem]
    notes: str | None = None


class StatusResponse(BaseModel):
    app_name: str
    last_scrape_at: datetime | None = None
    last_prediction_at: datetime | None = None
    last_change_detected_at: datetime | None = None
    monitoring_active: bool
    source_url: str