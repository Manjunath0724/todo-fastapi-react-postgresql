from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from models import *
from auth import *
from database import get_db
from email_service import (
    send_task_created_email,
    send_task_completed_email, 
    send_task_deleted_email,
    send_task_reminder_email
)
import os
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler


load_dotenv()


app = FastAPI(title="TaskFlow Pro API", version="1.0.0")


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","https://todo-fastapi-react-postgresql.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Scheduler for delayed emails
scheduler = AsyncIOScheduler()
scheduler.start()


def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"), sslmode="prefer")


# ==================== MODELS ====================


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    status: str = "in_progress"  # in_progress, completed
    due_date: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None


# 🔥 NEW: Profile Update Model
class UpdateProfileSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str
    status: str
    due_date: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_id: int


# ==================== AUTH ENDPOINTS ====================


@app.post("/api/auth/register", response_model=dict)
async def register(user: UserCreate, background_tasks: BackgroundTasks):
    """Register a new user"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check if user exists
    cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    cur.execute(
        "INSERT INTO users (email, hashed_password, full_name) VALUES (%s, %s, %s) RETURNING id, email, full_name",
        (user.email, hashed_password, user.full_name)
    )
    new_user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    # Create access token
    access_token = create_access_token(data={"user_id": new_user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "fullName": new_user["full_name"]
        }
    }


@app.post("/api/auth/login", response_model=dict)
async def login(credentials: dict):
    """Login user"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user or not verify_password(password, user['hashed_password']):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"user_id": user['id']})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "fullName": user.get('full_name', user.get('name', 'User'))
        }
    }


@app.get("/api/auth/me", response_model=dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, email, full_name FROM users WHERE id = %s", (current_user['id'],))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user['id'],
        "email": user['email'],
        "fullName": user.get('full_name', 'User')
    }


# 🔥 NEW: UPDATE PROFILE ENDPOINT
@app.put("/api/auth/profile", response_model=dict)
async def update_profile(
    profile: UpdateProfileSchema,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile (name/email) - Settings page"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check if email already exists (if changing email)
    if profile.email and profile.email != current_user.get('sub', ''):
        cur.execute("SELECT id FROM users WHERE email = %s AND id != %s", (profile.email, current_user['id']))
        if cur.fetchone():
            cur.close()
            conn.close()
            raise HTTPException(status_code=400, detail="Email already taken")
    
    # Build update query
    update_fields = []
    values = []
    
    if profile.full_name:
        update_fields.append("full_name = %s")
        values.append(profile.full_name)
    
    if profile.email:
        update_fields.append("email = %s")
        values.append(profile.email)
    
    if not update_fields:
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.extend([current_user['id']])
    
    query = f"""
        UPDATE users 
        SET {', '.join(update_fields)}
        WHERE id = %s 
        RETURNING id, email, full_name
    """
    
    cur.execute(query, values)
    updated_user = cur.fetchone()
    
    if not updated_user:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        "user": {
            "id": updated_user['id'],
            "email": updated_user['email'],
            "fullName": updated_user['full_name']
        },
        "message": "Profile updated successfully"
    }


# ==================== TASK ENDPOINTS ====================


@app.get("/api/tasks", response_model=List[dict])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    """Get all tasks for current user"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        """
        SELECT id, title, description, priority, status, due_date, created_at, updated_at, user_id 
        FROM tasks 
        WHERE user_id = %s 
        ORDER BY created_at DESC
        """,
        (current_user['id'],)
    )
    tasks = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(task) for task in tasks]


@app.post("/api/tasks", response_model=dict)
async def create_task(task: TaskCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Create a new task"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get user email
    cur.execute("SELECT email FROM users WHERE id = %s", (current_user['id'],))
    user = cur.fetchone()
    user_email = user['email']
    
    # Create task
    cur.execute(
        """
        INSERT INTO tasks (title, description, priority, status, due_date, user_id) 
        VALUES (%s, %s, %s, %s, %s, %s) 
        RETURNING id, title, description, priority, status, due_date, created_at, updated_at, user_id
        """,
        (task.title, task.description, task.priority, task.status, task.due_date, current_user['id'])
    )
    new_task = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    # Send immediate notification
    background_tasks.add_task(
        send_task_created_email,
        user_email,
        new_task['title'],
        new_task['description'] or '',
        new_task['due_date']
    )
    
    # Schedule reminder email after 1 minute
    scheduler.add_job(
        send_task_reminder_email,
        'date',
        run_date=datetime.now() + timedelta(minutes=1),
        args=[user_email, new_task['title'], new_task['description'] or '']
    )
    
    return dict(new_task)


@app.put("/api/tasks/{task_id}", response_model=dict)
async def update_task(
    task_id: int, 
    task_update: dict, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Update a task"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get user email and old task status
    cur.execute("SELECT email FROM users WHERE id = %s", (current_user['id'],))
    user = cur.fetchone()
    user_email = user['email']
    
    cur.execute("SELECT status, title FROM tasks WHERE id = %s AND user_id = %s", (task_id, current_user['id']))
    old_task = cur.fetchone()
    
    if not old_task:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    old_status = old_task['status']
    task_title = old_task['title']
    
    # Build update query dynamically
    update_fields = []
    values = []
    
    if 'title' in task_update and task_update['title']:
        update_fields.append("title = %s")
        values.append(task_update['title'])
        task_title = task_update['title']
    
    if 'description' in task_update:
        update_fields.append("description = %s")
        values.append(task_update['description'])
    
    if 'priority' in task_update and task_update['priority']:
        update_fields.append("priority = %s")
        values.append(task_update['priority'])
    
    if 'status' in task_update and task_update['status']:
        update_fields.append("status = %s")
        values.append(task_update['status'])
        
        # Send completion email if status changed to completed
        if old_status != 'completed' and task_update['status'] == 'completed':
            background_tasks.add_task(send_task_completed_email, user_email, task_title)
    
    if 'due_date' in task_update:
        update_fields.append("due_date = %s")
        values.append(task_update['due_date'])
    
    if not update_fields:
        cur.close()
        conn.close()
        return dict(old_task)
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    values.extend([task_id, current_user['id']])
    
    query = f"""
        UPDATE tasks 
        SET {', '.join(update_fields)}
        WHERE id = %s AND user_id = %s 
        RETURNING id, title, description, priority, status, due_date, created_at, updated_at, user_id
    """
    
    cur.execute(query, values)
    updated_task = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return dict(updated_task)


@app.delete("/api/tasks/{task_id}")
async def delete_task(
    task_id: int, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Delete a task"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get user email and task title
    cur.execute("SELECT email FROM users WHERE id = %s", (current_user['id'],))
    user = cur.fetchone()
    user_email = user['email']
    
    cur.execute("SELECT title FROM tasks WHERE id = %s AND user_id = %s", (task_id, current_user['id']))
    task = cur.fetchone()
    
    if not task:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_title = task['title']
    
    # Delete task
    cur.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, current_user['id']))
    deleted = cur.rowcount > 0
    conn.commit()
    cur.close()
    conn.close()
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Send deletion notification
    background_tasks.add_task(send_task_deleted_email, user_email, task_title)
    
    return {"message": "Task deleted successfully", "deleted": True}


# ==================== HEALTH CHECK ====================


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "TaskFlow Pro API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/api/health")
async def health_check():
    """API health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ==================== STARTUP EVENT ====================


@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create tasks table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            priority VARCHAR(50) DEFAULT 'medium',
            status VARCHAR(50) DEFAULT 'in_progress',
            due_date DATE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database tables initialized")
