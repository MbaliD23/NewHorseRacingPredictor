from fastapi import APIRouter, Depends

from app.core.dependencies import get_prediction_service
from app.schemas.prediction import PredictionRequest
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.post('/run')
async def run_prediction(payload: PredictionRequest, prediction_service: PredictionService = Depends(get_prediction_service)):
    return await prediction_service.run_prediction(payload.race_id, payload.selected_variables)
