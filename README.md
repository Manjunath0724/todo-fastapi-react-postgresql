# TaskFlow Pro - Professional Todo Web Application

A modern, feature-rich task management application built with React, Tailwind CSS, and FastAPI.

## 🚀 Features

- ✅ **Complete Task Management** - Create, read, update, and delete tasks
- 🎨 **Beautiful UI** - Professional design with blue gradient theme (#3B82F6 → #1D4ED8)
- 🌓 **Dark/Light Theme** - Toggle between themes with localStorage persistence
- 📊 **Analytics Dashboard** - Track productivity with interactive charts
- 📧 **Email Notifications** - SMTP integration for task events
  - Instant notification when task is created
  - Reminder email 1 minute after creation
  - Notification when task is completed
  - Notification when task is deleted
- 🔐 **JWT Authentication** - Secure login and signup
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🎯 **Priority Levels** - Organize tasks by low, medium, or high priority
- 🔍 **Advanced Filters** - Search and filter by status and priority
- 📥 **CSV Export** - Export your tasks data
- ⚡ **Real-time Updates** - Instant UI updates after operations

## 📸 Pages

1. **Dashboard** - Overview with stats cards and recent tasks
2. **All Tasks** - Complete task list with search and filters
3. **Analytics** - Productivity trends and statistics with charts
4. **Settings** - Profile management, theme toggle, and CSV export

## 🛠️ Tech Stack

### Frontend
- React 19.2.4
- React Router DOM 7.13.0
- Tailwind CSS 3.4.19
- Lucide React (Icons)
- Chart.js + React-Chartjs-2
- Axios

### Backend
- FastAPI 0.111.0
- PostgreSQL (psycopg2-binary)
- JWT Authentication (python-jose)
- Password Hashing (passlib with bcrypt)
- SMTP Email (aiosmtplib)
- APScheduler (for delayed emails)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/taskflow
   SECRET_KEY=your-secret-key-here
   
   # SMTP Configuration (for email notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

   **For Gmail:**
   - Enable 2-factor authentication in your Google Account
   - Go to Google Account > Security > 2-Step Verification > App passwords
   - Generate an app password and use it in `SMTP_PASSWORD`

5. **Run the backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## 🎯 Usage

### Authentication
1. **Sign Up**: Create a new account with name, email, and password
2. **Login**: Use your credentials or demo account:
   - Email: `demo@taskflow.com`
   - Password: `demo123`

### Task Management
1. **Create Task**: Click "+ Add Task" button
2. **Edit Task**: Click edit icon on any task
3. **Complete Task**: Click the checkbox
4. **Delete Task**: Click the trash icon
5. **Filter Tasks**: Use search bar and filter dropdowns

### Email Notifications
When a task is created:
- ✉️ Instant email with task details
- ⏰ Reminder email after 1 minute
- ✅ Completion notification when marked as done
- 🗑️ Deletion notification when removed

### Theme Toggle
- Click the theme toggle in Settings
- Theme preference is saved automatically

### Export Data
- Go to Settings > Data Export
- Click "Export to CSV" to download your tasks

## 🎨 Color Scheme

- **Primary Blue**: `#3B82F6`
- **Primary Dark**: `#1D4ED8`
- **Background Light**: `#F8FAFC`
- **Background Dark**: `#0F172A`
- **Card Light**: `#FFFFFF`
- **Card Dark**: `#1E293B`

## 📁 Project Structure

```
todo-list/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── AllTasks.js
│   │   │   ├── Analytics.js
│   │   │   ├── Settings.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── Sidebar.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/
    ├── main.py
    ├── auth.py
    ├── models.py
    ├── database.py
    ├── email_service.py
    ├── requirements.txt
    └── .env
```

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- CORS configured for specific origins
- SQL injection prevention with parameterized queries
- Input validation with Pydantic models

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Health
- `GET /` - Root endpoint
- `GET /api/health` - Health check

## 🐛 Troubleshooting

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check if app password is correct (for Gmail)
- Ensure 2FA is enabled for Gmail
- Check firewall/antivirus settings

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Frontend Not Loading
- Check if backend is running on port 8000
- Verify REACT_APP_API_URL in frontend `.env`
- Clear browser cache

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Built with ❤️ using React, Tailwind CSS, and FastAPI

## 🙏 Acknowledgments

- Tailwind CSS for the amazing utility-first CSS framework
- Lucide React for beautiful icons
- Chart.js for interactive charts
- FastAPI for the modern Python web framework

