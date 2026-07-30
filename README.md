# 🏇 NewHorseRacingPredictor

A FastAPI-based horse racing prediction and monitoring platform that collects horse racing data, stores race information, and provides a foundation for race prediction, analytics, and monitoring.

---

# 📋 Project Overview

The NewHorseRacingPredictor application is responsible for:

- Scraping horse racing data from external sources
- Monitoring race information automatically
- Managing horse and race data
- Storing data in a database
- Providing API endpoints for future integrations
- Supporting future prediction and analytics features

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|----------|
| FastAPI | REST API Framework |
| SQLAlchemy | ORM |
| Alembic | Database Migrations |
| SQLite | Local Development Database |
| PostgreSQL | Production Database Option |
| APScheduler | Scheduled Jobs |
| HTTPX | Async HTTP Requests |
| BeautifulSoup4 | Web Scraping |
| Pydantic | Validation & Configuration |

---

# 📂 Repository

GitHub Repository:

```text
https://github.com/MbaliD23/NewHorseRacingPredictor
```

Clone URL:

```bash
git clone https://github.com/MbaliD23/NewHorseRacingPredictor.git
```

---

# ✅ Prerequisites

Before setting up the project, install:

## Git

Download:

```text
https://git-scm.com/downloads
```

Verify:

```bash
git --version
```

---

## Python

Download:

```text
https://www.python.org/downloads/
```

During installation ensure:

```text
✅ Add Python to PATH
```

Verify:

```bash
python --version
```

Expected output:

```text
Python 3.x.x
```

---

## VS Code (Recommended)

Download:

```text
https://code.visualstudio.com/
```

Recommended Extensions:

- Python
- Pylance
- GitHub Pull Requests
- SQLTools

---

# 🚀 Getting Started

## Step 1: Clone the Repository

```bash
git clone https://github.com/MbaliD23/NewHorseRacingPredictor.git
cd NewHorseRacingPredictor
```

---

## Step 2: Create a Virtual Environment

### Windows

```cmd
python -m venv .venv
```

---

## Step 3: Activate the Virtual Environment

### Command Prompt

```cmd
.venv\Scripts\activate
```

### PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

You should now see:

```text
(.venv)
```

at the beginning of your terminal.

---

## Step 4: Upgrade pip

```cmd
python -m pip install --upgrade pip
```

---

## Step 5: Install Project Dependencies

```cmd
python -m pip install -r requirements.txt
```

---

## Step 6: Configure Environment Variables

Create a local environment file:

### Windows

```cmd
copy .env.example .env
```

Open the `.env` file and verify the settings.

Example:

```env
APP_NAME=HorseRacingPredictor
APP_ENV=development
DEBUG=true

DATABASE_URL=sqlite+aiosqlite:///./horseracingpredictor.db
SYNC_DATABASE_URL=sqlite:///./horseracingpredictor.db

WEBSITE_URL=https://legacy.winningform.co.za

SCRAPE_INTERVAL_SECONDS=10800
REQUEST_TIMEOUT_SECONDS=30

LOG_LEVEL=INFO
```

---

## Step 7: Apply Database Migrations

```cmd
alembic upgrade head
```

---

## Step 8: Start the Application

```cmd
python -m uvicorn app.main:app --reload --port 8080
```

Successful startup:

```text
INFO: Uvicorn running on http://127.0.0.1:8080
```

---

# 🌐 Application URLs

Application:

```text
http://127.0.0.1:8080
```

Swagger Documentation:

```text
http://127.0.0.1:8080/docs
```

ReDoc Documentation:

```text
http://127.0.0.1:8080/redoc
```

---

# 👨‍💻 Daily Development Workflow

## Pull Latest Changes

Before working:

```bash
git pull
```

---

## Activate Environment

```cmd
.venv\Scripts\activate
```

---

## Start the Application

```cmd
python -m uvicorn app.main:app --reload --port 8080
```

---

# 🌿 Git Workflow

## Create a Feature Branch

```bash
git checkout -b feature/feature-name
```

Example:

```bash
git checkout -b feature/race-prediction-service
```

---

## Check Changes

```bash
git status
```

---

## Stage Changes

```bash
git add .
```

---

## Commit Changes

```bash
git commit -m "Add race prediction service"
```

---

## Push Changes

```bash
git push origin feature/feature-name
```

---

## Create Pull Request

Create a Pull Request on GitHub and request a review.

---

# 🤝 Contributors

To contribute:

1. Send your GitHub username to the project admin.
2. Request collaborator access.
3. Clone the repository.
4. Follow the setup instructions above.
5. Create a feature branch.
6. Submit a Pull Request.

---

# 🔧 Troubleshooting

## Missing Packages

Reinstall:

```cmd
python -m pip install -r requirements.txt
```

---

## Recreate Virtual Environment

Delete existing environment:

```cmd
rmdir /s /q .venv
```

Create a new one:

```cmd
python -m venv .venv
```

Activate:

```cmd
.venv\Scripts\activate
```

Install requirements:

```cmd
python -m pip install -r requirements.txt
```

---

## Verify Python Installation

```cmd
python --version
```

Verify pip:

```cmd
pip --version
```

List packages:

```cmd
pip list
```

---

## SSL Certificate Error

If you encounter:

```text
SSL: CERTIFICATE_VERIFY_FAILED
```

This is typically caused by:

- Corporate proxies
- SSL inspection
- Company network certificates

Contact the project administrator for assistance.

---

## Port Already In Use

If port 8080 is being used:

```cmd
python -m uvicorn app.main:app --reload --port 8081
```

---

# 📁 Important Files

```text
app/                    Main application code
alembic/                Database migrations
tests/                  Unit and integration tests
.env                    Local environment variables
.env.example            Example environment variables
requirements.txt        Python dependencies
pyproject.toml          Project configuration
alembic.ini             Alembic configuration
```

---

# 🚫 Files Not Committed To Git

The following files are intentionally ignored:

```text
.venv/
.env
logs/
*.db
__pycache__/
*.pyc
*.egg-info/
```

These files are machine-specific and should not be committed.

---

# 🎯 Project Status

✅ Repository Migrated

✅ GitHub Collaboration Enabled

✅ API Running

✅ Database Configured

✅ Scheduled Jobs Enabled

✅ Documentation Available

✅ Ready For Team Contributions