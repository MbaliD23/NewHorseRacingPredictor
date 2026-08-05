# API Response Verification

Verified against the running FastAPI backend after the route-service mismatch fix.

## GET /api/races

Status: JSON returned successfully.

Actual shape:

```ts
Array<{
  id: number;
  venue: string;
  meeting_date: string | null;
  races: Array<{
    id: number;
    race_number: number;
    race_time: string | null;
    distance: string | null;
    surface: string | null;
    field_size: number | null;
    status: string | null;
    title: string | null;
    runners: number;
    is_live: boolean;
    is_upcoming: boolean;
  }>;
}>
```

Sample verified first venue:

- `id`: `9`
- `venue`: `Vaal`
- `meeting_date`: `2026-08-06`
- nested race `id`: `67`

## GET /api/races/{race_id}

Verified with `GET /api/races/67`.

Status: JSON returned successfully.

Actual shape:

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

Sample verified race:

- `id`: `67`
- `venue`: `Vaal`
- `race_number`: `1`
- first horse: `Battleground`

## GET /api/status/last-updated

Status: JSON returned successfully.

Actual shape:

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

## POST /api/predictions/run

Verified with:

```json
{
  "race_id": 67,
  "selected_variables": [
    "trainer_ranking",
    "jockey_rating",
    "starting_price"
  ]
}
```

Status: JSON returned successfully.

Actual shape:

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

Sample verified prediction:

- `race_id`: `67`
- first predicted horse: `Battleground`
- prediction fields came from backend response only.
