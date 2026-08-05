# Working Backend Flow

Source of truth: server-rendered UI in `app/web/router.py` and `app/templates/`.

This document describes how the working backend-rendered UI loads and displays venues, meetings, races, horses, and predictions.

## Page 1: Locations / Venues

| Item | Actual Flow |
| --- | --- |
| Route | `GET /` |
| Web handler | `home()` in `app/web/router.py` |
| Template | `app/templates/home.html` |
| Service method | `RaceService.list_venues()` |
| Status service method | `StatusService.get_status()` |
| Repository method | `RaceRepository.list_meetings()` |
| Schemas used | `VenueView`, `RaceCardView`, `StatusResponse` |

### Returned Data

`RaceService.list_venues()` returns `list[VenueView]`.

Each venue contains:

- `id`
- `venue`
- `meeting_date`
- `races`

Each nested race card contains:

- `id`
- `race_number`
- `race_time`
- `distance`
- `surface`
- `field_size`
- `status`
- `title`
- `runners`
- `is_live`
- `is_upcoming`

`home.html` displays:

- `status.monitoring_active`
- `status.last_scrape_at`
- `status.last_prediction_at`
- `venue.venue`
- `venue.meeting_date`
- `venue.races|length`
- link to `/venues/{{ venue.id }}`

## Page 2: Venue Races

| Item | Actual Flow |
| --- | --- |
| Route | `GET /venues/{meeting_id}` |
| Web handler | `venue_page()` in `app/web/router.py` |
| Template | `app/templates/venue.html` |
| Service method | `RaceService.get_venue(meeting_id)` |
| Status service method | `StatusService.get_status()` |
| Repository method | `RaceRepository.get_meeting(meeting_id)` |
| Schemas used | `VenueView`, `RaceCardView`, `StatusResponse` |

### Returned Data

`RaceService.get_venue()` returns `VenueView | None`.

The template displays:

- `venue.venue`
- `race.race_number`
- `race.race_time`
- `race.is_live`
- `race.is_upcoming`
- `race.title`
- `race.distance`
- `race.surface`
- `race.runners`
- link to `/races/{{ race.id }}`

## Page 3: Race Horses

| Item | Actual Flow |
| --- | --- |
| Route | `GET /races/{race_id}` |
| Web handler | `race_page()` in `app/web/router.py` |
| Template | `app/templates/race_detail.html` |
| Service method | `RaceService.get_race_view(race_id)` |
| Status service method | `StatusService.get_status()` |
| Repository method | `RaceRepository.get_race(race_id)` |
| Schemas used | `RaceView`, `HorseView`, `StatusResponse` |

### Returned Data

`RaceService.get_race_view()` returns `RaceView | None`.

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

Horse fields:

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

The template displays:

- race venue, date, time, distance, surface, field size
- horse name
- horse status
- trainer name
- jockey name
- link to `/horses/{{ horse.id }}`
- link to `/races/{{ race.id }}/analytics`

## Page 4: Horse Details

| Item | Actual Flow |
| --- | --- |
| Route | `GET /horses/{horse_id}` |
| Web handler | `horse_page()` in `app/web/router.py` |
| Template | `app/templates/horse_detail.html` |
| Service method | `RaceService.get_horse_view(horse_id)` |
| Repository method | `RaceRepository.get_horse(horse_id)` |
| Schemas used | `HorseView` |

### Returned Data

`RaceService.get_horse_view()` returns `HorseView | None`.

The template displays:

- `horse.name`
- `horse.race_id`
- `horse.trainer_name`
- `horse.trainer_ranking`
- `horse.jockey_name`
- `horse.jockey_rating`
- `horse.draw_number`
- `horse.weight_value`
- `horse.starting_price`
- `horse.previous_run_rating`
- `horse.scratched`
- `horse.status`

Missing values display as `Unavailable`.

## Page 5: Analysis / Factor Selection

| Item | Actual Flow |
| --- | --- |
| Route | `GET /races/{race_id}/analytics` |
| Web handler | `analytics_page()` in `app/web/router.py` |
| Template | `app/templates/analytics.html` |
| Service method | `RaceService.get_race_view(race_id)` |
| Repository method | `RaceRepository.get_race(race_id)` |
| Schemas used | `RaceView`, `HorseView`, `VARIABLE_LABELS` |

### Returned Data

`RaceService.get_race_view()` returns `RaceView | None`.

The route also builds:

```python
variables = [{"code": code, "label": label} for code, label in VARIABLE_LABELS.items()]
```

Available variables:

- `trainer_ranking`
- `jockey_rating`
- `draw_advantage`
- `weight`
- `starting_price`
- `previous_run`

The template displays:

- race back link
- six selectable variables
- form posting to `/races/{{ race.id }}/prediction`

## Page 6: Prediction Results

| Item | Actual Flow |
| --- | --- |
| Route | `POST /races/{race_id}/prediction` |
| Web handler | `prediction_page()` in `app/web/router.py` |
| Template | `app/templates/prediction_results.html` |
| Prediction service method | `PredictionService.run_prediction(race_id, selected_variables)` |
| Repository methods | `RaceRepository.get_race()`, `PredictionRepository.create_run()`, `PredictionRepository.create_prediction()`, `PredictionRepository.create_score()` |
| Schemas used | `PredictionRequest` validation concept, `PredictionResponse`, `PredictionItem` |

### Returned Data

`PredictionService.run_prediction()` returns `PredictionResponse`.

Response fields:

- `race_id`
- `run_at`
- `selected_variables`
- `predictions`
- `notes`

Prediction item fields:

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

The template displays:

- `result.notes`
- `item.predicted_position`
- `item.horse_name`
- `item.confidence_percent`
- `item.trainer_name`
- `item.jockey_name`
- `item.weight_value`
- `item.draw_number`
- `item.overall_score`
- `item.key_factors`
- link to `/races/{{ result.race_id }}/final/{{ item.horse_id }}`

## Additional Working Backend Page: Final Horse Result

| Item | Actual Flow |
| --- | --- |
| Route | `GET /races/{race_id}/final/{horse_id}` |
| Web handler | `final_horse_page()` |
| Template | `app/templates/final_horse.html` |
| Service methods | `PredictionService.run_prediction(...)`, `RaceService.get_horse_view(horse_id)` |
| Repository methods | Same prediction methods as Page 6 plus `RaceRepository.get_horse()` |

This page is not part of the six React pages requested, but it confirms the backend uses the same prediction and horse view services for final result details.
