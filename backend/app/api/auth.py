from datetime import datetime, timedelta
import os
import bcrypt

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User


router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "ai-gym-development-secret-change-before-deployment"
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# =========================
# REQUEST / RESPONSE MODELS
# =========================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None

    fitness_goal: str | None = None
    activity_level: str | None = None


class ProfileUpdateRequest(BaseModel):
    name: str
    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None
    fitness_goal: str | None = None
    activity_level: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int | None
    gender: str | None
    height: float | None
    weight: float | None
    fitness_goal: str | None
    activity_level: str | None
    is_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================
# PASSWORD FUNCTIONS
# =========================

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    password_hash: str
) -> bool:

    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


# =========================
# JWT TOKEN
# =========================

def create_access_token(user_id: int) -> str:

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================
# REGISTER
# =========================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),

        age=user_data.age,
        gender=user_data.gender,
        height=user_data.height,
        weight=user_data.weight,

        fitness_goal=user_data.fitness_goal,
        activity_level=user_data.activity_level,

        is_admin=False
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# =========================
# LOGIN
# =========================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================
# MY PROFILE
# =========================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return current_user


# =========================
# UPDATE PROFILE
# =========================

@router.put(
    "/profile",
    response_model=UserResponse
)
def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Basic validation
    if profile_data.age is not None:
        if profile_data.age < 10 or profile_data.age > 100:
            raise HTTPException(
                status_code=400,
                detail="Age must be between 10 and 100"
            )

    if profile_data.height is not None:
        if profile_data.height < 80 or profile_data.height > 250:
            raise HTTPException(
                status_code=400,
                detail="Height must be between 80 and 250 cm"
            )

    if profile_data.weight is not None:
        if profile_data.weight < 20 or profile_data.weight > 300:
            raise HTTPException(
                status_code=400,
                detail="Weight must be between 20 and 300 kg"
            )

    # Update profile
    current_user.name = profile_data.name
    current_user.age = profile_data.age
    current_user.gender = profile_data.gender
    current_user.height = profile_data.height
    current_user.weight = profile_data.weight
    current_user.fitness_goal = profile_data.fitness_goal
    current_user.activity_level = profile_data.activity_level

    db.commit()
    db.refresh(current_user)

    return current_user