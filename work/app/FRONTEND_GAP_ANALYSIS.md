# Frontend Gap Analysis

Scope: `frontend/src`.

Backend source of truth: `BACKEND_CONTRACT_AUDIT.md`.

## Frontend Routes

Current routes in `frontend/src/routes/AppRouter.tsx`:

- `/` -> `LocationsPage`
- `/venues/:venueId` -> `VenueRacesPage`
- `/races/:raceId` -> `RaceHorsesPage`
- `/horses/:horseId` -> `HorseDetailsPage`
- `/analysis/:raceId` -> `AnalysisFactorsPage`
- `/predictions/results` -> `PredictionResultsPage`

These routes match the requested frontend route shape, but not all routes have a usable backend JSON contract.

## API Services And Hooks

| Frontend item | Current API call | Actual backend contract | Gap |
| --- | --- | --- | --- |
| `getRaces()` / `useRaces()` | `GET /api/races` | Route exists but calls missing `RaceService.list_meetings_grouped()` and returns HTTP 500 | Locations and Venue Races cannot receive venue list data from current backend |
| `getRace()` / `useRace()` | `GET /api/races/{race_id}` | Working JSON `RaceView | null` | Type should allow `null` |
| `getHorse()` / `useHorse()` | `GET /horses/{horse_id}` | HTML web route, not JSON API | Must not be used as Axios JSON source |
| `getStatus()` / `useStatus()` | `GET /api/status/last-updated` | Working JSON `StatusResponse` | Aligned |
| `runPrediction()` / `usePrediction()` | `POST /api/predictions/run` | Working JSON `PredictionResponse` | Type should match all actual fields and remove unsupported `reason` |

## Types

### `Race`, `RaceCard`, `Venue`, `Horse`

Mostly aligned with schemas in `app/schemas/race.py`.

Required fix:

- `getRace()` can return `null` when backend race does not exist, so hook/page code should account for `Race | null`.

### `PredictionResponse` And `PredictionItem`

Current type makes actual backend fields optional and includes `reason`, which the backend does not return.

Required fix:

- Make actual backend response fields required where backend schema requires them.
- Include actual nullable fields:
  - `trainer_name`
  - `jockey_name`
  - `draw_number`
  - `weight_value`
  - `starting_price`
  - `previous_run_rating`
  - `notes`
- Remove unsupported `reason`.

## Page Audit

## 1. Locations Page

| Item | Current State |
| --- | --- |
| Current API call | `useRaces()` -> `GET /api/races` |
| Expected frontend contract | List of venues with `id`, `venue`, `meeting_date`, and `races[]` |
| Actual backend contract | `GET /api/races` exists but fails with HTTP 500 because route calls missing service method |
| Mismatch | Page assumes a successful venue array that backend currently cannot return |
| Fix required | Keep loading/error/empty states; do not fabricate venues. Display unavailable/error state when `/api/races` fails. Do not synthesize location cards. |

### Actual Available Fields

None from `GET /api/races` in its current broken state.

### Unsupported UI Features

- Venue cards populated from backend cannot render unless endpoint succeeds in the future.
- Search/filter can only operate on returned backend data; with current backend, no data is available.

## 2. Venue Races Page

| Item | Current State |
| --- | --- |
| Current API call | `useRaces()` -> `GET /api/races` |
| Expected frontend contract | Find venue by `venueId`, then render nested `races[]` |
| Actual backend contract | `GET /api/races` fails with HTTP 500 |
| Mismatch | Page assumes venue list data exists |
| Fix required | Do not fabricate venue/race list. Show unavailable/error state when venue list cannot be loaded. If a venue exists in client state from a prior successful response, only display those backend-provided fields. |

### Actual Available Fields

None from `GET /api/races` in its current broken state.

### Unsupported UI Features

- Venue title by ID
- Race rows by venue
- Venue-level live/upcoming filters
- Bottom-right prediction button based on first venue race

All require the broken venue list endpoint or prior client state.

## 3. Race Horses Page

| Item | Current State |
| --- | --- |
| Current API call | `useRace(raceId)` -> `GET /api/races/{race_id}` |
| Expected frontend contract | Race details plus `horses[]` |
| Actual backend contract | Working `RaceView | null` |
| Mismatch | Mostly aligned; page should treat `null` as unavailable |
| Fix required | Ensure `Race | null` handling and display `Unavailable` for nullable fields. Continue avoiding odds/form/images/badges. |

### Actual Available Fields

Race:

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

Horse:

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

### Unsupported UI Features

- Horse images
- Odds unless displaying backend `starting_price`
- Form sequence
- Favorite/trainer badges
- Prediction engine promo

## 4. Horse Detail Page

| Item | Current State |
| --- | --- |
| Current API call | `useHorse(horseId)` -> `GET /horses/{horse_id}` and optional `useRace()` fallback |
| Expected frontend contract | Horse detail JSON |
| Actual backend contract | `/horses/{horse_id}` is an HTML web route, not JSON. No JSON horse detail endpoint exists. |
| Mismatch | Axios requests HTML and types it as `Horse` |
| Fix required | Remove JSON call to `/horses/{horse_id}`. Use only `currentHorse`/`currentRace.horses[]` data already obtained from `GET /api/races/{race_id}`. If no race/horse data is present, display unavailable state. |

### Actual Available Fields

Only available when the frontend already has a `HorseView` object from `GET /api/races/{race_id}`:

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

### Unsupported UI Features

- Direct refresh of `/horses/:horseId` with JSON fetch
- Horse image
- AI prediction widgets
- Performance score
- Recent form
- Track and distance fit
- Compare to field
- Career summary
- Betting insights

## 5. Analysis Factors Page

| Item | Current State |
| --- | --- |
| Current API call | `useRace(raceId)` -> `GET /api/races/{race_id}`; `usePrediction()` -> `POST /api/predictions/run` |
| Expected frontend contract | Race exists, exactly 3 selected variables sent to backend |
| Actual backend contract | Working `RaceView | null`; prediction request requires exactly 3 valid variables |
| Mismatch | Mostly aligned. Must surface prediction errors and not imply unavailable variable values are present. |
| Fix required | Keep allowed variable set exactly as backend. Disable proceed unless race exists and exactly 3 factors selected. Show backend mutation error if prediction fails. |

### Actual Available Fields

Allowed variables:

- `trainer_ranking`
- `jockey_rating`
- `draw_advantage`
- `weight`
- `starting_price`
- `previous_run`

### Unsupported UI Features

- Any factor value display before prediction unless sourced from race horses.
- Any alternate variable outside backend allowed set.

## 6. Prediction Results Page

| Item | Current State |
| --- | --- |
| Current API call | No direct call; reads `predictionResult` from Zustand after `POST /api/predictions/run` |
| Expected frontend contract | Render prediction result returned by backend |
| Actual backend contract | `PredictionResponse` with `predictions[]`; item field is `notes`, not `reason` |
| Mismatch | Type includes unsupported `reason`; page ignores actual item `notes` and response `notes` |
| Fix required | Remove `reason`; render only actual returned fields: rank, horse name, score, confidence, key factors, metrics, notes, and selected variables. |

### Actual Available Fields

Prediction result:

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

### Unsupported UI Features

- Horse pictures
- SP badges beyond backend `starting_price`
- 3D model
- select-a-horse continuation panel
- selected horse panel
- betting suggestions
- projected returns
- win probability

## Required Frontend Refactor Summary

1. Keep `GET /api/races` as the only configured venue-list API, but handle its current failure as an error/unavailable state without fake venues.
2. Change `GET /api/races/{race_id}` typing to `Race | null`.
3. Stop using `/horses/{horse_id}` as JSON. Remove the live Axios horse detail query from the Horse Detail page.
4. Align prediction types to the exact backend `PredictionResponse`.
5. Update Prediction Results to render `notes` instead of unsupported `reason`.
6. Update Analysis Factors to require a loaded race before submitting predictions and show mutation errors.
7. Maintain all unsupported UI features as unavailable/omitted rather than invented.
