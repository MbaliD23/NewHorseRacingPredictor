# 🏇 NewHorseRacingPredictor

A modern horse racing prediction and monitoring platform that collects horse racing data, stores race information, and provides advanced analytics through a seamless React frontend and a FastAPI backend.

---

## 📋 Project Structure

This repository uses a decoupled architecture with clear separation between the API backend and the user interface.

- **`backend/`**: A FastAPI application that handles web scraping, database management, background jobs (APScheduler), and serves as a REST API.
- **`frontend/`**: A modern React/Vite application providing the user interface for interacting with the platform.

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Step 1: Clone the Repository

```bash
git clone https://github.com/MbaliD23/NewHorseRacingPredictor.git
cd NewHorseRacingPredictor
```

---

### Step 2: Set Up the Backend

The backend is built with Python and FastAPI. You will need Python 3.10+ installed.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   - **Windows:**
     ```cmd
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Copy the example environment file and customize it if needed.
   - **Windows:** `copy .env.example .env`
   - **macOS/Linux:** `cp .env.example .env`

5. **Apply database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --port 8080
   ```
   *The API will be available at `http://127.0.0.1:8080`*
   *API Documentation is available at `http://127.0.0.1:8080/docs`*

---

### Step 3: Set Up the Frontend

The frontend is built with React and Vite. You will need Node.js installed.

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   *The UI will be accessible at the Local URL printed in the terminal (usually `http://localhost:5173`).*

---

## 👨‍💻 Daily Development Workflow

When returning to work on the project, you need to run both the backend and frontend simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8080
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🌿 Git Workflow

1. Update your local repository: `git pull origin main`
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes in either `backend/` or `frontend/`.
4. Stage and commit: 
   ```bash
   git add .
   git commit -m "Add a descriptive commit message"
   ```
5. Push to GitHub: `git push -u origin feature/your-feature-name`
6. Create a Pull Request on GitHub.

---

## 🔧 Troubleshooting

- **Backend `ModuleNotFoundError`**: Ensure you have activated your virtual environment (`.venv\Scripts\activate`) and have run `pip install -r requirements.txt` while inside the `backend/` directory.
- **Frontend `command not found: npm`**: Ensure Node.js is installed on your system.
- **Port In Use (Backend)**: If port `8080` is in use, start the backend on a different port using `--port 8081` and update the frontend's API base URL.
- **SSL Errors (Backend)**: Usually caused by corporate proxies or firewalls preventing Python from downloading packages or scraping data.