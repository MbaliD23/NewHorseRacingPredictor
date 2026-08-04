from fastapi import APIRouter, Depends

from app.core.dependencies import get_race_service
from app.services.race_service import RaceService

router = APIRouter()


@router.get('')
async def list_races(race_service: RaceService = Depends(get_race_service)):
    return await race_service.list_meetings_grouped()


@router.get('/archive')
async def list_archived_races(race_service: RaceService = Depends(get_race_service)):
    return await race_service.list_archived_venues()


@router.get('/{race_id}')
async def get_race(race_id: int, race_service: RaceService = Depends(get_race_service)):
    return await race_service.get_race_view(race_id)
