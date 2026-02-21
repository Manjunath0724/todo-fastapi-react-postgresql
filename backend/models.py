# Purpose: Pydantic schemas for request/response validation
# Why: Ensures API contracts are explicit and type-safe across routes
# How: Used by FastAPI to parse/validate payloads and serialize responses

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Signup payload
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

# Login payload
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Public user representation
class User(BaseModel):
    id: int
    email: str
    name: str
    class Config:
        from_attributes = True

# JWT envelope
class Token(BaseModel):
    access_token: str
    token_type: str

# Base todo attributes shared across variants
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = ""

# Creation payload mirrors base fields
class TodoCreate(TodoBase):
    pass

# Persistent todo model returned from DB
class Todo(TodoBase):
    id: int
    completed: bool
    created_at: datetime
    user_id: int
    class Config:
        from_attributes = True
