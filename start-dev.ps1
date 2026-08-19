$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Start-DevProcess {
    param(
        [string] $Title,
        [string] $WorkingDirectory,
        [string] $Command
    )

    Start-Process powershell -WorkingDirectory $WorkingDirectory -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
        "$Host.UI.RawUI.WindowTitle = '$Title'; $Command"
    )
}

$python = Join-Path $backend ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    $python = "python"
}

Start-DevProcess `
    -Title "Horse Racing API" `
    -WorkingDirectory $backend `
    -Command "$python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8080"

Start-DevProcess `
    -Title "Horse Racing UI" `
    -WorkingDirectory $frontend `
    -Command "npm run dev"

Write-Host "Started the API on http://127.0.0.1:8080 and the UI via Vite."
Write-Host "Use the frontend URL printed in the Horse Racing UI window."
