# Backend Contract Audit

Scope: `app/api/routes`, `app/services`, `app/repositories`, and `app/schemas`.

Important constraint: the backend is the source of truth. This audit documents the backend that actually exists and does not propose backend changes.

## API Router Mounts

`app/main.py` mounts `api_router` at `/api`.

`app/api/router.py` includes:

- `races.router` at `/api/races`
- `predictions.router` at `/api/predictions`
- `status.router` at `/api/status`

The backend also mounts `web_router` without the `/api` prefix. Those routes return HTML templates and are not JSON API endpoints.

## Endpoint: GET /api/races

| Item | Actual Contract |
| --- | --- |
| Route path | `GET /api/races` |
| Route handler | `list_races()` in `app/api/routes/races.py` |
| Request schema | None |
| Actual service method called | `RaceService.list_meetings_grouped()` |
| Repository path intended by nearby service code | `RaceRepository.list_meetings()` via `RaceService.list_venues()`, but that method is not called |
| Actual response structure | The route currently raises `AttributeError` because `RaceService` has no `list_meetings_grouped` method |
| Actual runtime result | HTTP 500 with generic exception payload/trace depending debug settings |

### Fields Available

No successful JSON payload is available from this endpoint as implemented.

### Fields Missing

All venue/race list fields are unavailable through this API route because the service method does not exist.

If the route had called `RaceService.list_venues()`, the service would return `list[VenueView]` with:

- `id`
- `venue`
- `meeting_date`
- `races[]`
- `races[].id`
- `races[].race_number`
- `races[].race_time`
- `races[].distance`
- `races[].surface`
- `races[].field_size`
- `races[].status`
- `races[].title`
- `races[].runners`
- `races[].is_live`
- `races[].is_upcoming`

That is not the actual route contract today because the route does not call `list_venues()`.

### Frontend Pages Impacted

- Locations Page
- Venue Races Page

### Frontend Implication

Frontend code must treat `GET /api/races` as unavailable/error-prone unless the backend is changed in the future. The frontend must not fabricate venue or race list data.

## Endpoint: GET /api/races/{race_id}

| Item | Actual Contract |
| --- | --- |
| Route path | `GET /api/races/{race_id}` |
| Route handler | `get_race(race_id: int)` in `app/api/routes/races.py` |
| Request schema | Path parameter: `race_id: int` |
| Actual service method called | `RaceService.get_race_view(race_id)` |
| Repository method called | `RaceRepository.get_race(race_id)` |
| Actual response structure | `RaceView` JSON object, or `null` if the race does not exist |

### Actual Response Structure

```ts
{
  id: number;
  meeting_id: number;
  venue: string;
  meeting_date: string | null;
  race_number: number;
  race_time: string | null;
  distance: string | null;
  surface: string | null;
  field_size: number | null;
  status: string | null;
  title: string | null;
  horses: Array<{
    id: number;
    race_id: number;
    name: string;
    trainer_name: string | null;
    trainer_ranking: number | null;
    jockey_name: string | null;
    jockey_rating: number | null;
    draw_number: number | null;
    weight_value: number | null;
    starting_price: number | null;
    previous_run_rating: number | null;
    scratched: boolean;
    status: string | null;
    notes: string | null;
  }>;
}
```

### Fields Available

Race fields:

- `id`
- `meeting_id`
- `venue`
- `meeting_date`
- `race_number`
- `race_time`
- `distance`
- `surface`
- `field_size`
- `status`
- `title`
- `horses`

Horse fields inside `horses`:

- `id`
- `race_id`
- `name`
- `trainer_name`
- `trainer_ranking`
- `jockey_name`
- `jockey_rating`
- `draw_number`
- `weight_value`
- `starting_price`
- `previous_run_rating`
- `scratched`
- `status`
- `notes`

### Fields Missing

Race-level fields not returned:

- race image
- venue image
- decorative artwork
- odds
- form guide
- AI rank
- betting insight
- performance score
- race history
- track fit
- career summary

Horse fields not returned:

- horse image
- form sequence
- odds label separate from `starting_price`
- favorite badge
- trainer badge
- prediction widgets

### Frontend Pages Impacted

- Race Horses Page
- Horse Detail Page, if using race data to find a horse
- Analysis Factors Page, for race existence/context

## Endpoint: POST /api/predictions/run

| Item | Actual Contract |
| --- | --- |
| Route path | `POST /api/predictions/run` |
| Route handler | `run_prediction(payload: PredictionRequest)` in `app/api/routes/predictions.py` |
| Request schema | `PredictionRequest` |
| Actual service method called | `PredictionService.run_prediction(payload.race_id, payload.selected_variables)` |
| Repository methods called | `RaceRepository.get_race`, `PredictionRepository.create_run`, `PredictionRepository.create_prediction`, `PredictionRepository.create_score` |
| Actual response structure | `PredictionResponse` JSON object |

### Request Schema

```ts
{
  race_id: number;
  selected_variables: string[]; // exactly 3 distinct values
}
```

Allowed `selected_variables`:

- `trainer_ranking`
- `jockey_rating`
- `draw_advantage`
- `weight`
- `starting_price`
- `previous_run`

Validation:

- exactly 3 values
- all values must be distinct
- all values must be in the allowed variable set

### Actual Response Structure

```ts
{
  race_id: number;
  run_at: string;
  selected_variables: string[];
  predictions: Array<{
    horse_id: number;
    horse_name: string;
    predicted_position: 1 | 2 | 3;
    overall_score: number;
    confidence_percent: number;
    key_factors: string[];
    strongest_metric: string | null;
    weakest_metric: string | null;
    trainer_name: string | null;
    jockey_name: string | null;
    draw_number: number | null;
    weight_value: number | null;
    starting_price: number | null;
    previous_run_rating: number | null;
    notes: string | null;
  }>;
  notes: string | null;
}
```

### Error Behavior

- `422` if not exactly 3 selected variables.
- `422` if Pydantic validation rejects unsupported or duplicate variables.
- `404` if race is not found.
- `400` if fewer than 3 active, non-scratched horses exist.

### Fields Available

Prediction response:

- `race_id`
- `run_at`
- `selected_variables`
- `predictions`
- `notes`

Prediction item:

- `horse_id`
- `horse_name`
- `predicted_position`
- `overall_score`
- `confidence_percent`
- `key_factors`
- `strongest_metric`
- `weakest_metric`
- `trainer_name`
- `jockey_name`
- `draw_number`
- `weight_value`
- `starting_price`
- `previous_run_rating`
- `notes`

### Fields Missing

Not returned:

- horse image
- SP display separate from `starting_price`
- betting suggestions
- projected returns
- win probability
- popularity
- 3D model metadata
- selected horse continuation state

### Frontend Pages Impacted

- Analysis Factors Page
- Prediction Results Page

## Endpoint: GET /api/status/last-updated

| Item | Actual Contract |
| --- | --- |
| Route path | `GET /api/status/last-updated` |
| Route handler | `get_status()` in `app/api/routes/status.py` |
| Request schema | None |
| Actual service method called | `StatusService.get_status()` |
| Repository methods called | `ScrapeHistoryRepository.latest()` and direct `PredictionRun` query |
| Actual response structure | `StatusResponse` JSON object |

### Actual Response Structure

```ts
{
  app_name: string;
  last_scrape_at: string | null;
  last_prediction_at: string | null;
  last_change_detected_at: string | null;
  monitoring_active: boolean;
  source_url: string;
}
```

### Fields Available

- `app_name`
- `last_scrape_at`
- `last_prediction_at`
- `last_change_detected_at`
- `monitoring_active`
- `source_url`

### Fields Missing

Not returned:

- current race day label
- frontend clock
- detailed monitor health
- venue-level live status

### Frontend Pages Impacted

- Shared app header/status display
- Any page showing live/last updated state

## Non-API Web Route: GET /horses/{horse_id}

| Item | Actual Contract |
| --- | --- |
| Route path | `GET /horses/{horse_id}` |
| Router | `web_router`, not `api_router` |
| Response type | `HTMLResponse` |
| Service method called | `RaceService.get_horse_view(horse_id)` |
| Actual response structure | Rendered HTML template, not JSON |

### Frontend Pages Impacted

- Horse Detail Page, if the frontend attempts Axios JSON loading from `/horses/{horse_id}`

### Frontend Implication

The frontend must not treat `/horses/{horse_id}` as a JSON API endpoint. Since no JSON horse detail API exists, horse detail data must come from already loaded `RaceView.horses[]` data when available. If it is not available, fields must display `Unavailable` or the page must show an unavailable state.

## Summary Of Actual Backend JSON Contract

Working JSON endpoints:

- `GET /api/races/{race_id}`
- `POST /api/predictions/run`
- `GET /api/status/last-updated`

Broken JSON endpoint:

- `GET /api/races`, because it calls missing `RaceService.list_meetings_grouped()`

No JSON endpoint exists for:

- venue detail by meeting ID
- horse detail by horse ID

Frontend alignment must therefore avoid depending on a working venue list response or standalone horse detail JSON response unless the backend is changed later.
