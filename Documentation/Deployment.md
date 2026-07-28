# Deployment

## Uvicorn

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Gunicorn + Uvicorn workers

```bash
gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 2
```

## Docker outline

1. Build from Python 3.11 slim.
2. Install dependencies from `requirements.txt`.
3. Copy the source tree.
4. Run `alembic upgrade head` during startup or release phase.
5. Start Uvicorn or Gunicorn.

## Reverse proxy

Place Nginx or Caddy in front for TLS, compression, and buffering.
