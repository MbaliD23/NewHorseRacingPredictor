# Database Design

## Core tables

- `race_meetings`: venue-level grouping.
- `races`: individual races under a meeting.
- `horses`: horses tied to races with extracted metrics.
- `trainers`, `jockeys`: normalized participant tables.
- `prediction_runs`: one record per prediction execution.
- `predictions`: top-three result rows per run.
- `scores`: per-variable normalized contributions.
- `variables`: master list of allowed scoring variables.
- `logs`: database-backed operational logs.
- `scrape_history`: hourly scrape audit trail with checksums.

## Historical retention

No extracted history should be overwritten conceptually. New prediction runs and scrape history rows are appended. Horse and race entities are updated in-place for current state, while checksums and prediction runs preserve monitoring history.

## Indexing

External IDs, race numbers, meeting dates, and entity names are indexed for lookup speed.
