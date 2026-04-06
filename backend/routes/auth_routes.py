from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from auth import create_access_token, hash_password, verify_password
from database import get_db
from models import AuthResponse, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(data: UserCreate):
    db = get_db()

    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(data.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password must be at least 6 characters"
        )

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(user_id, data.email)

    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, name=data.name, email=data.email),
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin):
    db = get_db()

    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token(user_id, data.email)

    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, name=user["name"], email=data.email),
    )
