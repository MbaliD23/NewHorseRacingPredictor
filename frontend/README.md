# Horse Racing Predictor Frontend

Standalone React + TypeScript frontend for the existing FastAPI backend.

## Run

```bash
npm install
npm run dev
```

The API base URL defaults to `http://127.0.0.1:8000` and can be changed with `VITE_API_BASE_URL`.

## Backend Contract

The frontend only reads business data from:

- `GET /api/races`
- `GET /api/races/{race_id}`
- `GET /horses/{horse_id}`
- `GET /api/status/last-updated`
- `POST /api/predictions/run`

Missing fields are rendered as unavailable or omitted, depending on the page requirements.
