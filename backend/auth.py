# Purpose: JWT auth utilities for FastAPI routes (hashing, token create/verify)
# Why: Centralizes security logic used across auth-protected endpoints
# How: Exposed helpers integrate with main.py via dependency injection and JWT headers

# stdlib + third‑party imports
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
import secrets

# Load .env config so SECRET_KEY/ALGORITHM/EXPIRY are available
load_dotenv()

# Read secret key from env; auto-generate for local dev if missing
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "your-secret-key-here-change-in-production":
    SECRET_KEY = secrets.token_hex(32)  # random 64-hex chars for JWT signing
    print(f"[AUTO] Generated JWT SECRET_KEY")

# JWT algorithm and token lifetime (default 30 days) derived from env
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 43200))

# Password hashing context (bcrypt) and OAuth2 bearer token extractor
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Purpose: verify user-supplied password against stored hash
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Purpose: produce a bcrypt hash for a plaintext password
def get_password_hash(password):
    return pwd_context.hash(password)

# Purpose: build a signed JWT with an expiry carrying provided claims
# How: encodes with SECRET_KEY and ALGORITHM; used by login/register flows
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Purpose: FastAPI dependency to authenticate requests via Bearer token
# Why: Ensures protected routes only proceed with valid JWT
# How: Decodes JWT and exposes minimal user identity to route handlers
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return {"id": user_id}
    except JWTError:
        raise credentials_exception
