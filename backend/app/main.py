from contextlib import asynccontextmanager
from pathlib import Path
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import engine
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.services.monitoring_service import MonitoringService

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)
monitoring_service = MonitoringService()


def _detect_legacy_alembic_revision() -> str | None:
    sync_engine = create_engine(settings.sync_database_url, future=True)
    try:
        inspector = inspect(sync_engine)
        table_names = set(inspector.get_table_names())
        if 'alembic_version' in table_names:
            with sync_engine.connect() as connection:
                existing_revision = connection.execute(text('SELECT version_num FROM alembic_version LIMIT 1')).scalar_one_or_none()
            if existing_revision:
                return None
        if not table_names:
            return None

        revision = '0001_initial'
        horse_columns = {column['name'] for column in inspector.get_columns('horses')} if 'horses' in table_names else set()
        if {'trainer_jockey_win_percent', 'speed_index', 'predicted_time'}.issubset(horse_columns):
            revision = '0002_prediction_variable_replacement'
        if {'odds', 'equipment', 'pedigree_description', 'dob', 'silks', 'stakes', 'sale_price'}.issubset(horse_columns):
            revision = '288780da9e6d'
        return revision
    finally:
        sync_engine.dispose()


def _repair_stale_alembic_revision() -> None:
    sync_engine = create_engine(settings.sync_database_url, future=True)
    try:
        inspector = inspect(sync_engine)
        if 'alembic_version' not in inspector.get_table_names():
            return

        with sync_engine.begin() as connection:
            existing_revision = connection.execute(text('SELECT version_num FROM alembic_version LIMIT 1')).scalar_one_or_none()
            if existing_revision == '0008_add_team_record_columns':
                connection.execute(
                    text("UPDATE alembic_version SET version_num = '0007_add_recent_form_columns'")
                )
                logger.warning('repaired_stale_alembic_revision from=%s to=%s', existing_revision, '0007_add_recent_form_columns')
    finally:
        sync_engine.dispose()


def run_startup_migrations() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    alembic_cfg = Config(str(backend_dir / 'alembic.ini'))
    alembic_cfg.set_main_option('script_location', str(backend_dir / 'alembic'))
    alembic_cfg.set_main_option('sqlalchemy.url', settings.sync_database_url)
    legacy_revision = _detect_legacy_alembic_revision()
    if legacy_revision is not None:
        command.stamp(alembic_cfg, legacy_revision)
    _repair_stale_alembic_revision()
    command.upgrade(alembic_cfg, 'head')


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(run_startup_migrations)
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
app.include_router(api_router, prefix='/api')
register_exception_handlers(app)
