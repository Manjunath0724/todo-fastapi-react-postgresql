# 🚀 TaskFlow Pro - Complete Setup Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [SMTP Email Configuration](#smtp-email-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Windows Users:
```bash
# Double-click setup.bat or run:
setup.bat
```

### For Linux/Mac Users:
```bash
chmod +x setup.sh
./setup.sh
```

Then configure your `.env` files and start the servers (see below).

---

## Detailed Setup

### 1. Backend Setup

#### Step 1: Navigate to backend directory
```bash
cd backend
```

#### Step 2: Create Python virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Configure environment variables
```bash
# Copy example file
cp .env.example .env

# Edit .env file with your settings
```

**Required `.env` variables:**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/taskflow

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# SMTP (Email Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=your-email@gmail.com
```

---

### 2. Frontend Setup

#### Step 1: Navigate to frontend directory
```bash
cd frontend
```

#### Step 2: Install Node.js dependencies
```bash
npm install
```

#### Step 3: Configure environment variables
```bash
# Copy example file
cp .env.example .env
```

**Frontend `.env` file:**
```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## SMTP Email Configuration

### Gmail Setup (Recommended)

#### Option 1: Using App Password (Recommended)

1. **Enable 2-Factor Authentication:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification" and follow the setup

2. **Generate App Password:**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this in `SMTP_PASSWORD`

3. **Configure `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

#### Option 2: Less Secure App Access (Not Recommended)
- Enable "Less secure app access" in Google Account settings
- Use your regular Gmail password
- **Note:** This is less secure and may be disabled by Google

### Outlook/Hotmail Setup

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@outlook.com
```

### Other Email Providers

| Provider | SMTP Host | Port |
|----------|-----------|------|
| Yahoo | smtp.mail.yahoo.com | 587 |
| ProtonMail | 127.0.0.1 | 1025 |
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |

### Testing Without Email

To run the app without email notifications:
```env
# Leave these empty or comment out
SMTP_USER=
SMTP_PASSWORD=
```

The app will still work, but email notifications will be skipped.

---

## Database Setup

### PostgreSQL Installation

#### Windows:
1. Download [PostgreSQL installer](https://www.postgresql.org/download/windows/)
2. Run installer and follow prompts
3. Remember your password for the `postgres` user

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Mac (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taskflow;

# Create user (optional)
CREATE USER taskflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflow_user;

# Exit
\q
```

### Database URL Format

```env
DATABASE_URL=postgresql://username:password@host:port/database

# Examples:
# Local: postgresql://postgres:password@localhost:5432/taskflow
# Custom user: postgresql://taskflow_user:pass123@localhost:5432/taskflow
# Remote: postgresql://user:pass@example.com:5432/taskflow
```

### Auto Table Creation

The backend automatically creates required tables on startup:
- `users` - User accounts
- `tasks` - Task data

No manual SQL migration needed!

---

## Running the Application

### Method 1: Two Separate Terminals

#### Terminal 1 - Backend:
```bash
cd backend
# Activate venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Start FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

Frontend will open automatically at http://localhost:3000

### Method 2: Using npm concurrently (Advanced)

Create a `package.json` in the root:
```json
{
  "scripts": {
    "start": "concurrently \"cd backend && uvicorn main:app --reload\" \"cd frontend && npm start\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

Then:
```bash
npm install
npm start
```

---

## Testing

### Test Backend API

1. **Visit API Documentation:**
   - Open http://localhost:8000/docs
   - Interactive Swagger UI for testing endpoints

2. **Test Health Check:**
```bash
curl http://localhost:8000/api/health
```

3. **Test Registration:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test Frontend

1. Open http://localhost:3000
2. Sign up with a new account
3. Try creating a task
4. Check your email for notifications (if SMTP configured)

### Demo Account

For quick testing, use:
- **Email:** demo@taskflow.com
- **Password:** demo123

(You'll need to create this account first via signup)

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors (Frontend)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 2. "Cannot connect to database" (Backend)
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL in `.env`
- Test connection: `psql postgresql://username:password@localhost:5432/taskflow`

#### 3. Email not sending
- Verify SMTP credentials
- Check if 2FA is enabled (Gmail)
- Use App Password, not regular password
- Check spam folder
- Look at backend console for error messages

#### 4. CORS errors
- Ensure backend is running on port 8000
- Check REACT_APP_API_URL in frontend `.env`
- Clear browser cache

#### 5. Port already in use
```bash
# Find process using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

#### 6. Python package installation fails
```bash
# Update pip
pip install --upgrade pip

# Install with --user flag
pip install --user -r requirements.txt
```

### Email-Specific Issues

**Gmail "Username and Password not accepted":**
- Solution: Use App Password, not regular password
- Enable 2FA first

**Outlook "Authentication failed":**
- Solution: Check if "Less secure app access" is enabled

**Email delayed:**
- Normal behavior: 1-minute delay for reminder emails
- Check APScheduler is running (should see logs in backend)

### Database Issues

**"role does not exist":**
```sql
-- Create user in PostgreSQL
CREATE USER your_username WITH PASSWORD 'your_password';
```

**"database does not exist":**
```sql
-- Create database
CREATE DATABASE taskflow;
```

**Permission denied:**
```sql
-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE taskflow TO your_username;
```

### Need Help?

1. Check backend console for error messages
2. Check browser console (F12) for frontend errors
3. Review README.md
4. Check FastAPI docs at http://localhost:8000/docs

---

## Production Deployment

### Environment Variables for Production

```env
# Use strong secret key
SECRET_KEY=$(openssl rand -hex 32)

# Use production database
DATABASE_URL=postgresql://user:pass@prod-db:5432/taskflow

# Use production SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Security Checklist

- [ ] Change SECRET_KEY to a strong random value
- [ ] Use environment variables, not .env files
- [ ] Enable HTTPS/SSL
- [ ] Use a production database (not localhost)
- [ ] Set up proper CORS origins
- [ ] Use a production SMTP service (SendGrid, Mailgun, etc.)
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Happy Task Managing! 🎉**
