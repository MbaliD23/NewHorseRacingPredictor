# Setup

## Local development

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

## PostgreSQL example

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/horseracingpredictor
SYNC_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/horseracingpredictor
```
