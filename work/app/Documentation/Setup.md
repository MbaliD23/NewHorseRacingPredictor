# Setup

This guide walks through how to run both the backend and the frontend locally for development.

## Prerequisites

Make sure the following are installed before you start:

- Python 3.11 or newer
- Node.js and npm
- Git

## Project structure

The project is split into two main parts:

- `backend/` - FastAPI API, database setup, background monitoring, and scraping logic
- `frontend/` - React and Vite user interface

## 1. Open the project folder

Start in the project root:

```powershell
cd NewHorseRacingPredictor
```

## 2. Run the backend

Open a terminal for the backend and follow these steps.

### Step 2.1: Move into the backend folder

```powershell
cd backend
```

### Step 2.2: Create a virtual environment

Windows:

```powershell
python -m venv .venv
```

macOS or Linux:

```bash
python3 -m venv .venv
```

### Step 2.3: Activate the virtual environment

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
.venv\Scripts\activate.bat
```

macOS or Linux:

```bash
source .venv/bin/activate
```

### Step 2.4: Install backend dependencies

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2.5: Create the environment file

Windows:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

### Step 2.6: Apply database migrations

```powershell
alembic upgrade head
```

### Step 2.7: Start the backend server

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
```

When the backend starts successfully, these URLs should work:

- API base URL: `http://127.0.0.1:8080`
- API docs: `http://127.0.0.1:8080/docs`

## 3. Run the frontend

Open a second terminal for the frontend and follow these steps.

### Step 3.1: Move into the frontend folder

If you are still inside `backend/`, go back to the project root first:

```powershell
cd ..
cd frontend
```

### Step 3.2: Install frontend dependencies

```powershell
npm install
```

### Step 3.3: Confirm the frontend API URL

The frontend uses the value from `.env`.

Expected value:

```env
VITE_API_BASE_URL=http://127.0.0.1:8080
```

### Step 3.4: Start the frontend development server

```powershell
npm run dev
```

The frontend should start on:

- Frontend URL: `http://127.0.0.1:5173`

If port `5173` is already in use, Vite may choose another port and print it in the terminal.

## 4. Daily development workflow

Each time you come back to the project, run both services.

### Terminal 1: Backend

```powershell
cd NewHorseRacingPredictor\backend
.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
```

### Terminal 2: Frontend

```powershell
cd NewHorseRacingPredictor\frontend
npm run dev
```

## 5. How to verify everything is working

Use this quick checklist:

1. Open `http://127.0.0.1:8080/docs` and confirm the backend documentation page loads.
2. Open `http://127.0.0.1:5173` and confirm the frontend loads.
3. Navigate through the venues and races pages to confirm the frontend can talk to the backend.

## 6. Common problems

### Backend dependencies are missing

If you see errors such as `ModuleNotFoundError`, activate the virtual environment and reinstall dependencies:

```powershell
pip install -r requirements.txt
```

### PowerShell blocks virtual environment activation

If PowerShell prevents `.ps1` activation, use Command Prompt instead:

```cmd
.venv\Scripts\activate.bat
```

### Frontend cannot reach the backend

Check that:

- the backend is running on port `8080`
- `frontend/.env` points to `http://127.0.0.1:8080`
- there are no typos in the environment file

### Port 8080 is already in use

Start the backend on another port:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8081
```

Then update the frontend environment value:

```env
VITE_API_BASE_URL=http://127.0.0.1:8081
```

### Port 5173 is already in use

Vite will usually choose the next available port automatically. Check the terminal output for the correct frontend URL.

## 7. Optional PostgreSQL example

If you want to use PostgreSQL instead of SQLite, your environment variables can look like this:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/horseracingpredictor
SYNC_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/horseracingpredictor
```
