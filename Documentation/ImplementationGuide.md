# Implementation Guide

## 1. Create the project

1. Create the root folders: `app`, `alembic`, `tests`, and `Documentation`.
2. Separate API routes from web routes.
3. Add dedicated folders for repositories, services, scrapers, interfaces, schemas, background logic, templates, and static assets.

## 2. Install packages

Use either:

```bash
pip install -r requirements.txt
```

or:

```bash
pip install -e .
```

## 3. Configure settings

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `SYNC_DATABASE_URL`, and `SCRAPE_INTERVAL_SECONDS`.
3. The interval is clamped to at least 3600 seconds to respect the hourly check requirement.

## 4. Build the ORM layer

1. Define timestamp mixins.
2. Create entities for meetings, races, horses, trainers, jockeys, predictions, prediction runs, variables, scores, logs, and scrape history.
3. Add indexes to external IDs and name fields.

## 5. Configure Alembic

1. Point Alembic to the sync database URL.
2. Import metadata from the SQLAlchemy base.
3. Apply the initial migration.

## 6. Build the scraper

1. Use async `httpx`.
2. Parse HTML with BeautifulSoup + lxml.
3. Fetch the index and guide pages, then inspect linked race pages.
4. Extract only data that exists in the HTML.
5. Store scrape checksums to detect changes.

## 7. Build background monitoring

1. Create an APScheduler `AsyncIOScheduler`.
2. Register a single interval job using the configured interval.
3. Start the first run on application startup.
4. Stop the scheduler cleanly during shutdown.

## 8. Build the prediction engine

1. Expose six supported variables.
2. Require exactly three selected variables.
3. Normalize each variable per race.
4. Average selected normalized scores.
5. Reduce confidence when fields are missing.

## 9. Build web and API routes

1. `/` renders meetings grouped by venue.
2. `/races/{race_id}` renders a detail page.
3. `/api/predictions/run` accepts AJAX requests.
4. `/api/status/last-updated` supports lightweight polling.

## 10. Run and test

```bash
alembic upgrade head
uvicorn app.main:app --reload
pytest
```

## 11. Deploy

Run Uvicorn directly for small installs or behind Gunicorn/Nginx for production. Containerization steps are described in `Deployment.md`.
