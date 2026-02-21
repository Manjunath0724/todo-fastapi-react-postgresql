# Purpose: SQLAlchemy session/engine setup (used by legacy or future ORM usage)
# Why: Provides a standard DB session factory for models using SQLAlchemy
# How: Reads DATABASE_URL from env and exposes get_db dependency for routes

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables so DATABASE_URL is available
load_dotenv()

# Connection string for PostgreSQL (e.g., postgresql://user:pass@host:port/db)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine and session factory; no autocommit/autoflush for explicit control
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI dependency that yields a DB session and ensures proper cleanup
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
