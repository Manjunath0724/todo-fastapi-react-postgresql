@echo off
echo.
echo =====================================================
echo   TaskFlow Pro - Setup Script (Windows)
echo =====================================================
echo.

REM Backend Setup
echo [94m[*] Setting up Backend...[0m
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing backend dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [93m[!] Please edit backend\.env with your database and SMTP credentials[0m
)

cd ..

REM Frontend Setup
echo.
echo [94m[*] Setting up Frontend...[0m
cd frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

cd ..

echo.
echo [92m[+] Setup complete![0m
echo.
echo [94mNext steps:[0m
echo 1. Configure backend\.env with your PostgreSQL and SMTP settings
echo 2. Start the backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo 3. Start the frontend: cd frontend ^&^& npm start
echo.
echo [93mFor Gmail SMTP:[0m
echo - Enable 2FA in Google Account
echo - Generate App Password: https://myaccount.google.com/apppasswords
echo - Use the App Password in SMTP_PASSWORD
echo.
echo Check README.md for full documentation
echo.
pause
