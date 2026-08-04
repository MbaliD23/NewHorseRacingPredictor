from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = Field(default='HorseRacingPredictor', alias='APP_NAME')
    app_env: str = Field(default='development', alias='APP_ENV')
    debug: bool = Field(default=True, alias='DEBUG')
    secret_key: str = Field(default='change-me', alias='SECRET_KEY')
    database_url: str = Field(default='sqlite+aiosqlite:///./horseracingpredictor.db', alias='DATABASE_URL')
    sync_database_url: str = Field(default='sqlite:///./horseracingpredictor.db', alias='SYNC_DATABASE_URL')
    website_url: str = Field(default='https://legacy.winningform.co.za', alias='WEBSITE_URL')
    scrape_interval_seconds: int = Field(default=3600, alias='SCRAPE_INTERVAL_SECONDS')
    request_timeout_seconds: int = Field(default=30, alias='REQUEST_TIMEOUT_SECONDS')
    log_level: str = Field(default='INFO', alias='LOG_LEVEL')
    default_variables: str = Field(default='draw_advantage,weight,previous_run', alias='DEFAULT_VARIABLES')
    allowed_origins_raw: str = Field(default='*', alias='ALLOWED_ORIGINS')
    trainer_jockey_weight: float = Field(default=1.0, alias='TRAINER_JOCKEY_WEIGHT')
    draw_weight: float = Field(default=1.0, alias='DRAW_WEIGHT')
    weight_weight: float = Field(default=1.0, alias='WEIGHT_WEIGHT')
    previous_run_weight: float = Field(default=1.0, alias='PREVIOUS_RUN_WEIGHT')
    speed_index_weight: float = Field(default=1.0, alias='SPEED_INDEX_WEIGHT')
    predicted_time_weight: float = Field(default=1.0, alias='PREDICTED_TIME_WEIGHT')

    @field_validator('scrape_interval_seconds')
    @classmethod
    def validate_interval(cls, value: int) -> int:
        return max(value, 3600)

    @property
    def default_variable_list(self) -> List[str]:
        return [item.strip() for item in self.default_variables.split(',') if item.strip()]

    @property
    def allowed_origins(self) -> List[str]:
        if self.allowed_origins_raw.strip() == '*':
            return ['*']
        return [item.strip() for item in self.allowed_origins_raw.split(',') if item.strip()]


@lru_cache

def get_settings() -> Settings:
    return Settings()
