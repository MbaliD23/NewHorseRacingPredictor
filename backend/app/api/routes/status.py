from fastapi import APIRouter, Depends

from app.core.dependencies import get_status_service
from app.services.status_service import StatusService

router = APIRouter()


@router.get('/last-updated')
async def get_status(status_service: StatusService = Depends(get_status_service)):
    return await status_service.get_status()
