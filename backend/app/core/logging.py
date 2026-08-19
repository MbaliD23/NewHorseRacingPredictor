import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def configure_logging(level: str = 'INFO') -> None:
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
        handlers=[
            RotatingFileHandler(logs_dir / 'app.log', maxBytes=1_000_000, backupCount=5),
            logging.StreamHandler(),
        ],
        force=True,
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
