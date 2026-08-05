from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.services.monitoring_service import MonitoringService
from app.web.router import web_router

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)
monitoring_service = MonitoringService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await monitoring_service.start()
    logger.info('application_started')
    try:
        yield
    finally:
        await monitoring_service.stop()
        await engine.dispose()
        logger.info('application_stopped')


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.mount('/static', StaticFiles(directory='app/static'), name='static')
app.include_router(web_router)
app.include_router(api_router, prefix='/api')
register_exception_handlers(app)
