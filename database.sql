-- TaskFlow Pro Database Schema

-- Step 1: Create the database
-- Run this in psql or your PostgreSQL client:
-- CREATE DATABASE taskflow;

-- Step 2: Connect to the database
-- \c taskflow

-- Step 3: Create tables (or let the backend auto-create them on startup)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed
    due_date DATE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Sample demo user (optional)
-- Password: demo123
INSERT INTO users (email, hashed_password, full_name) 
VALUES ('demo@taskflow.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeQ.9bjMdaVi', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Sample tasks for demo user (optional)
INSERT INTO tasks (title, description, priority, status, due_date, user_id)
SELECT 
    'Welcome to TaskFlow Pro!',
    'Start by exploring the dashboard and creating your first task.',
    'high',
    'in_progress',
    CURRENT_DATE + INTERVAL '7 days',
    id
FROM users WHERE email = 'demo@taskflow.com'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, priority, status, due_date, user_id)
SELECT 
    'Complete project documentation',
    'Write comprehensive docs for the new feature.',
    'medium',
    'in_progress',
    CURRENT_DATE + INTERVAL '3 days',
    id
FROM users WHERE email = 'demo@taskflow.com'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, priority, status, due_date, user_id)
SELECT 
    'Review pull requests',
    'Review and merge pending PRs from the team.',
    'high',
    'in_progress',
    CURRENT_DATE + INTERVAL '1 day',
    id
FROM users WHERE email = 'demo@taskflow.com'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, priority, status, user_id)
SELECT 
    'Setup CI/CD pipeline',
    'Configure automated testing and deployment.',
    'low',
    'completed',
    id
FROM users WHERE email = 'demo@taskflow.com'
ON CONFLICT DO NOTHING;

-- Note: The backend will automatically create these tables on startup
-- if they don't exist, so you don't need to run this SQL manually
-- unless you want to pre-create the schema or add sample data.
