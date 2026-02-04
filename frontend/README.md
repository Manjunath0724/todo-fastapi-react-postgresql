# TaskFlow Pro 🚀
## Professional Full-Stack Todo Application with JWT Auth & Word-by-Word Animations

**production-ready todo application** featuring **JWT authentication**, **word-by-word typewriter navbar animations**, **glassmorphism UI**, **full CRUD operations**, and **responsive TaskFlow Pro design**.

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🔐 **JWT Authentication** | ✅ Complete | Signup/Login with secure token storage |
| 📝 **Full CRUD Todos** | ✅ Complete | Create, Read, Update, Delete todos |
| ⌨️ **Word-by-Word Animation** | ✅ Complete | Navbar typewriter effect with motivational quotes |
| 🎨 **Glassmorphism UI** | ✅ Complete | Backdrop blur, gradients, professional shadows |
| 📊 **Responsive Design** | ✅ Complete | Mobile-first, perfect on all devices |
| 🗑️ **Delete Confirmation** | ✅ Complete | Safe delete with loading states |
| 👤 **User Profile** | ✅ Complete | Name fetched from database via `/me` endpoint |
| 🚀 **Production Ready** | ✅ Complete | Clean repo, .gitignore, deployment ready |

## 🛠️ Tech Stack

```
Frontend: React 18 + Tailwind CSS + Vite
Backend: FastAPI + PostgreSQL + JWT + bcrypt
Database: PostgreSQL 15 (psycopg2-binary)
Auth: python-jose + passlib[bcrypt]
Deployment: Vercel (Frontend) + Render (Backend)
```

## 📦 Prerequisites

- **Node.js** 18+ (`node --version`)
- **Python** 3.10+ (`python --version`) 
- **PostgreSQL** 13+ (`psql --version`)
- **Git** (`git --version`)

## 🚀 Quick Start (5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/taskflow-pro.git
cd taskflow-pro
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install fastapi uvicorn python-dotenv psycopg2-binary python-jose[cryptography] passlib[bcrypt] pydantic

# Copy environment template
cp .env.example .env
```

### 3. Database Setup

```sql
# Connect to PostgreSQL
psql -U postgres

# Create database & user
CREATE DATABASE todo_db;
CREATE USER todo_user WITH PASSWORD 'securepass123';
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;

# Connect to todo_db and create tables
\c todo_db

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO todo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO todo_user;
```

**Update `.env`:**
```env
DATABASE_URL=postgresql://todo_user:securepass123@localhost:5432/todo_db
SECRET_KEY=your-super-secret-key-here-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Run Backend

```bash
# Terminal 1
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
**✅ Backend: http://localhost:8000/docs**

### 5. Run Frontend

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```
**✅ Frontend: http://localhost:3000**

## 🧪 Testing

### Backend API Testing
```
http://localhost:8000/docs → Interactive API docs

1. POST /signup → {"email": "test@example.com", "password": "test123", "name": "John"}
2. POST /login → {"email": "test@example.com", "password": "test123"}
3. GET /todos → (with Bearer token)
4. POST /todos → {"title": "Buy groceries"}
```

### Frontend Testing
```
1. Signup → test@example.com / test123 / John
2. Login → Same credentials
3. Dashboard → Add/Toggle/Delete todos ✅
4. Navbar → Word-by-word animation cycles
```

## 📁 Project Structure

```
taskflow-pro/
├── .gitignore                 # Clean repo (no node_modules/.env)
├── backend/
│   ├── main.py              # FastAPI routes (CRUD + Auth)
│   ├── auth.py              # JWT + bcrypt utilities
│   ├── models.py            # Pydantic schemas
│   └── database.py          # DB connection
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js # Full CRUD + user profile
│   │   │   └── Navbar.js    # Word-by-word typewriter animation
│   │   └── services/
│   │       └── api.js       # API client (authAPI + todoAPI)
│   ├── tailwind.config.js   # Glassmorphism + gradients
│   └── vite.config.js       # React + Tailwind setup
└── README.md
```

## 🔧 Key Files Explained

| File | Purpose | Technologies |
|------|---------|--------------|
| `backend/main.py` | **FastAPI Routes** | 7 endpoints: `/signup`, `/login`, `/todos` (CRUD), `/me` |
| `backend/auth.py` | **JWT Auth** | `python-jose`, `passlib[bcrypt]`, token creation/validation |
| `frontend/src/Dashboard.js` | **Main UI** | React Hooks, Tailwind glassmorphism, full CRUD |
| `frontend/src/Navbar.js` | **Animated Navbar** | Word-by-word typewriter (type 80ms/char, delete 40ms/char) |
| `services/api.js` | **API Client** | Fetch wrapper, JWT token handling, error management |

## 🎨 UI/UX Features

```
✨ Word-by-word typewriter navbar (5 motivational quotes)
✨ Glassmorphism (backdrop-blur, white/20 backgrounds)
✨ Gradient buttons (blue→purple, red→rose, emerald→teal)
✨ Professional empty states
✨ Loading spinners + delete confirmation
✨ Responsive mobile-first design
✨ Pro badge + avatar initials
```

## 🚀 Deployment

### Production Backend (Render.com)
```
1. Push to GitHub ✅
2. Render.com → New Web Service → GitHub repo
3. Build: pip install -r requirements.txt
4. Start: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Production Frontend (Vercel)
```
1. vercel --prod
2. Update API_BASE = 'https://your-backend.onrender.com'
```

## 📈 Next Steps (Enhancements)

```bash
# 1. Add Drag & Drop (react-beautiful-dnd)
# 2. Task Categories/Priority (new DB table)
# 3. CSV Export (PapaParse)
# 4. Dark/Light theme toggle
# 5. PWA support (manifest.json)
# 6. Email notifications (Resend)
# 7. Analytics Dashboard (Chart.js)
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open Pull Request



## 👨‍💻 Author

**Your Name** - Full-Stack Developer  
[Portfolio](https://manjunathgavandi.netlify.app/) 
[GitHub](https://github.com/Manjunath0724)
[Linkedin](https://www.linkedin.com/in/manjunath-gavandi)

***

**⭐ Star this repo if it helped you build your portfolio!**