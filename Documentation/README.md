# HorseRacingPredictor

HorseRacingPredictor is a production-style FastAPI application for scraping live horse racing pages from the Winning Form legacy site, storing all extracted changes historically, running a modular Top 3 prediction engine, and serving a Hollywoodbets-inspired dashboard.

## Key capabilities

- Async FastAPI backend with separate API and web routers.
- Jinja2 + Bootstrap frontend with AJAX prediction execution and live status polling.
- SQLAlchemy 2.0 async ORM, Alembic migration support, PostgreSQL/SQLite compatibility.
- Hourly monitoring with APScheduler and change detection against the source site.
- Prediction engine restricted to extracted data only.
- Confidence reduction whenever extracted fields are incomplete.

## Source integrity

The scraper targets `https://legacy.winningform.co.za` and never fabricates race data. If fields such as trainer/jockey combination win percentage, speed index, predicted time, or previous run metrics are unavailable in the source HTML, the UI and prediction output clearly indicate reduced confidence.
