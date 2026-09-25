from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Challenge, UserChallenge
from ..api.auth import get_current_user


router = APIRouter(
    prefix="/challenges",
    tags=["Challenges"]
)


class ChallengeCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    duration_days: int = Field(..., ge=1, le=365)
    target: Optional[str] = None


class ChallengeJoin(BaseModel):
    challenge_id: int


class ChallengeProgress(BaseModel):
    progress: int = Field(..., ge=0)


@router.get("/")
def get_challenges(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenges = (
        db.query(Challenge)
        .filter(Challenge.is_active == True)
        .all()
    )

    joined = {
        item.challenge_id: item
        for item in db.query(UserChallenge)
        .filter(UserChallenge.user_id == current_user.id)
        .all()
    }

    result = []

    for challenge in challenges:
        user_challenge = joined.get(challenge.id)

        result.append({
            "id": challenge.id,
            "name": challenge.name,
            "description": challenge.description,
            "duration_days": challenge.duration_days,
            "target": challenge.target,
            "is_active": challenge.is_active,
            "joined": user_challenge is not None,
            "progress": (
                user_challenge.progress
                if user_challenge
                else 0
            ),
            "completed": (
                user_challenge.completed
                if user_challenge
                else False
            )
        })

    return {
        "challenges": result
    }


@router.post("/")
def create_challenge(
    challenge_data: ChallengeCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = Challenge(
        name=challenge_data.name,
        description=challenge_data.description,
        duration_days=challenge_data.duration_days,
        target=challenge_data.target,
        is_active=True
    )

    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return {
        "message": "Challenge created successfully",
        "challenge": {
            "id": challenge.id,
            "name": challenge.name,
            "description": challenge.description,
            "duration_days": challenge.duration_days,
            "target": challenge.target,
            "is_active": challenge.is_active
        }
    }


@router.post("/join")
def join_challenge(
    data: ChallengeJoin,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = (
        db.query(Challenge)
        .filter(
            Challenge.id == data.challenge_id,
            Challenge.is_active == True
        )
        .first()
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found"
        )

    existing = (
        db.query(UserChallenge)
        .filter(
            UserChallenge.user_id == current_user.id,
            UserChallenge.challenge_id == data.challenge_id
        )
        .first()
    )

    if existing:
        return {
            "message": "Already joined this challenge",
            "challenge_id": challenge.id,
            "progress": existing.progress,
            "completed": existing.completed
        }

    user_challenge = UserChallenge(
        user_id=current_user.id,
        challenge_id=challenge.id,
        progress=0,
        completed=False,
        joined_at=datetime.utcnow()
    )

    db.add(user_challenge)
    db.commit()
    db.refresh(user_challenge)

    return {
        "message": "Challenge joined successfully",
        "challenge_id": challenge.id,
        "progress": user_challenge.progress,
        "completed": user_challenge.completed
    }


@router.put("/{challenge_id}/progress")
def update_challenge_progress(
    challenge_id: int,
    data: ChallengeProgress,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found"
        )

    user_challenge = (
        db.query(UserChallenge)
        .filter(
            UserChallenge.user_id == current_user.id,
            UserChallenge.challenge_id == challenge_id
        )
        .first()
    )

    if not user_challenge:
        raise HTTPException(
            status_code=400,
            detail="Join the challenge before updating progress"
        )

    # target is stored as text in the existing model.
    # If it contains a number, use it as the completion target.
    try:
        target_value = int(challenge.target or 0)
    except ValueError:
        target_value = 0

    if target_value > 0:
        user_challenge.progress = min(
            data.progress,
            target_value
        )
        user_challenge.completed = (
            user_challenge.progress >= target_value
        )
    else:
        user_challenge.progress = data.progress
        user_challenge.completed = False

    db.commit()
    db.refresh(user_challenge)

    return {
        "message": "Challenge progress updated",
        "challenge_id": challenge_id,
        "progress": user_challenge.progress,
        "target": challenge.target,
        "completed": user_challenge.completed
    }