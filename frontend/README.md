# Horse Racing Predictor Frontend

Standalone React + TypeScript frontend for the existing FastAPI backend.

## Run

```bash
npm install
npm run dev
```

The frontend defaults to same-origin `/api` requests during local development.
Vite proxies those requests to `http://127.0.0.1:8080` by default, and you can override the backend target with `VITE_API_PROXY_TARGET`.
If you need the browser to call a different backend directly, set `VITE_API_BASE_URL` to a full URL instead.
..\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8080
## Backend Contract

The frontend only reads business data from:

- `GET /api/races`
- `GET /api/races/{race_id}`
- `GET /horses/{horse_id}`
- `GET /api/status/last-updated`
- `POST /api/predictions/run`

Missing fields are rendered as unavailable or omitted, depending on the page requirements.
