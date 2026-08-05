# API Mismatch Report

Scope: `app/api/routes` compared against the actual service layer used by the working backend-rendered UI.

## Summary

The working backend UI uses:

- `RaceService.list_venues()`
- `RaceService.get_venue(meeting_id)`
- `RaceService.get_race_view(race_id)`
- `RaceService.get_horse_view(horse_id)`
- `PredictionService.run_prediction(race_id, selected_variables)`
- `StatusService.get_status()`

The API layer mostly maps correctly, except for `GET /api/races`.

## Mismatch 1: GET /api/races

| Item | Current API Route |
| --- | --- |
| File | `app/api/routes/races.py` |
| Route | `GET /api/races` |
| Current service call | `RaceService.list_meetings_grouped()` |
| Actual service method available | `RaceService.list_venues()` |
| Working UI route using correct method | `GET /` via `home()` |
| Working UI service call | `RaceService.list_venues()` |
| Repository method behind correct service | `RaceRepository.list_meetings()` |
| Result of current API route | Broken: `AttributeError` because `RaceService` has no `list_meetings_grouped()` |

### Required Contract Fix

Change the API route to call:

```python
return await race_service.list_venues()
```

This does not change business logic, services, repositories, schemas, or database behavior. It only aligns the API route with the service method already used by the working backend-rendered home page.

## Endpoint Review

## GET /api/races

Status before fix: broken.

Required behavior: return the same `list[VenueView]` data used by `GET /`.

## GET /api/races/{race_id}

Status: aligned.

Current route calls:

```python
RaceService.get_race_view(race_id)
```

This is the same service method used by the working backend route:

```python
GET /races/{race_id}
```

No fix required.

## GET /api/status/last-updated

Status: aligned.

Current route calls:

```python
StatusService.get_status()
```

This is the same service method used by working backend pages that show status.

No fix required.

## POST /api/predictions/run

Status: aligned.

Current route calls:

```python
PredictionService.run_prediction(payload.race_id, payload.selected_variables)
```

This is the same prediction service used by:

```python
POST /races/{race_id}/prediction
```

No fix required.

## Non-API Web Route Note

`GET /horses/{horse_id}` is a working HTML route that calls:

```python
RaceService.get_horse_view(horse_id)
```

There is no matching JSON API route for horse details in `app/api/routes`. This is not a route-service mismatch. It is simply not part of the current JSON API surface.
