from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.services.prediction_service import PredictionService
from app.services.race_service import RaceService
from app.services.status_service import StatusService


def get_race_service(session: AsyncSession = Depends(get_db_session)) -> RaceService:
    return RaceService(session)


def get_prediction_service(session: AsyncSession = Depends(get_db_session)) -> PredictionService:
    return PredictionService(session)


def get_status_service(session: AsyncSession = Depends(get_db_session)) -> StatusService:
    return StatusService(session)
