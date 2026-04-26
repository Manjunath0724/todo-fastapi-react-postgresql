$VerbosePreference = 'Continue'
Write-Host "====================================================="
Write-Host "  TaskFlow Pro - Start Script (Windows)"
Write-Host "====================================================="
Write-Host ""

# Backend Setup & Start
Write-Host "[*] Setting up Backend..." -ForegroundColor Cyan
Set-Location -Path "backend"

if (-not (Test-Path -Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Activating venv and installing backend dependencies..."
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

Write-Host "Starting backend server..."
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `".\venv\Scripts\Activate.ps1; uvicorn main:app --reload`""

Set-Location -Path ".."

# Frontend Setup & Start
Write-Host ""
Write-Host "[*] Setting up Frontend..." -ForegroundColor Cyan
Set-Location -Path "frontend"

Write-Host "Installing frontend dependencies..."
npm install --legacy-peer-deps

Write-Host "Starting frontend development server..."
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `"npm start`""

Set-Location -Path ".."

Write-Host ""
Write-Host "[+] Setup complete! Servers are starting in the background." -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend API: http://localhost:8000"
Write-Host "API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "Press any key to stop all background processes and exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
Stop-Process -Name "node", "python" -ErrorAction SilentlyContinue
