from fastapi import APIRouter

from app.api.routes import predictions, races, status

api_router = APIRouter()
api_router.include_router(races.router, prefix='/races', tags=['races'])
api_router.include_router(predictions.router, prefix='/predictions', tags=['predictions'])
api_router.include_router(status.router, prefix='/status', tags=['status'])
