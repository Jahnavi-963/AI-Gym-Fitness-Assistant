from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re

from ..database import get_db
from ..models import User, WorkoutSession, Challenge, UserChallenge
from .auth import get_current_user


router = APIRouter(
    prefix="/workouts",
    tags=["Workout History"]
)


# -----------------------------
# Request model
# -----------------------------

class WorkoutSaveRequest(BaseModel):
    exercise: str
    reps: int
    form_score: float
    duration_seconds: int = 0
    calories_burned: float = 0


# -----------------------------
# Normalize exercise name
# -----------------------------

def normalize_exercise_name(name: str) -> str:
    """
    Convert common exercise variations
    into one standard name.
    """

    name = (name or "").strip().lower()

    # Remove spaces, hyphens and underscores
    name = re.sub(r"[\s_-]+", "", name)

    aliases = {
        "pushup": "pushup",
        "pushups": "pushup",
        "push-up": "pushup",

        "squat": "squat",
        "squats": "squat",

        "lunge": "lunge",
        "lunges": "lunge",

        "bicepcurl": "bicepcurl",
        "bicepcurls": "bicepcurl",

        "shoulderpress": "shoulderpress",
        "shoulderpresses": "shoulderpress",

        "plank": "plank",
        "planks": "plank",

        "jumpingjack": "jumpingjack",
        "jumpingjacks": "jumpingjack"
    }

    return aliases.get(name, name)


# -----------------------------
# Detect exercise in challenge
# -----------------------------

def challenge_matches_exercise(
    challenge: Challenge,
    exercise: str
) -> bool:
    """
    Check whether a challenge belongs to the workout exercise.

    Handles variations such as:
    pushup <-> push-ups
    squat <-> squats
    lunge <-> lunges
    """

    workout_exercise = normalize_exercise_name(exercise)

    challenge_text = (
        f"{challenge.name or ''} "
        f"{challenge.description or ''}"
    ).lower()

    # Known exercise variations
    exercise_patterns = {
        "pushup": [
            "pushup",
            "push-up",
            "push up",
            "pushups",
            "push-ups",
            "push ups"
        ],

        "squat": [
            "squat",
            "squats"
        ],

        "lunge": [
            "lunge",
            "lunges"
        ],

        "bicepcurl": [
            "bicep curl",
            "bicep curls",
            "biceps curl",
            "biceps curls"
        ],

        "shoulderpress": [
            "shoulder press",
            "shoulder presses"
        ],

        "plank": [
            "plank",
            "planks"
        ],

        "jumpingjack": [
            "jumping jack",
            "jumping jacks"
        ]
    }

    patterns = exercise_patterns.get(workout_exercise, [])

    for pattern in patterns:
        if pattern in challenge_text:
            return True

    return False


# -----------------------------
# Update challenge progress
# -----------------------------

def update_challenge_progress(
    db: Session,
    user_id: int,
    exercise: str,
    reps: int
):
    """
    Automatically add workout reps to matching
    active challenges joined by the user.
    """

    if reps <= 0:
        return

    joined_challenges = (
        db.query(UserChallenge)
        .join(
            Challenge,
            UserChallenge.challenge_id == Challenge.id
        )
        .filter(
            UserChallenge.user_id == user_id,
            Challenge.is_active == True
        )
        .all()
    )

    for user_challenge in joined_challenges:

        challenge = (
            db.query(Challenge)
            .filter(
                Challenge.id == user_challenge.challenge_id
            )
            .first()
        )

        if not challenge:
            continue

        # Check whether challenge matches workout
        if not challenge_matches_exercise(
            challenge,
            exercise
        ):
            continue

        # Do not update completed challenges
        if user_challenge.completed:
            continue

        current_progress = user_challenge.progress or 0

        try:
            target_value = int(
                challenge.target or 0
            )
        except (ValueError, TypeError):
            target_value = 0

        new_progress = current_progress + reps

        if target_value > 0:

            new_progress = min(
                new_progress,
                target_value
            )

            user_challenge.progress = new_progress

            if new_progress >= target_value:
                user_challenge.completed = True

        else:
            user_challenge.progress = new_progress

    db.commit()


# -----------------------------
# Save workout
# -----------------------------

@router.post("/save")
def save_workout(
    data: WorkoutSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    workout = WorkoutSession(
        user_id=current_user.id,
        exercise=data.exercise,
        reps=data.reps,
        form_score=data.form_score,
        duration_seconds=data.duration_seconds,
        calories_burned=data.calories_burned
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    # Automatically update matching challenges
    update_challenge_progress(
        db=db,
        user_id=current_user.id,
        exercise=data.exercise,
        reps=data.reps
    )

    return {
        "message": "Workout saved successfully",
        "workout_id": workout.id,
        "exercise": workout.exercise,
        "reps": workout.reps,
        "form_score": workout.form_score,
        "duration_seconds": workout.duration_seconds,
        "calories_burned": workout.calories_burned
    }


# -----------------------------
# Workout history
# -----------------------------

@router.get("/history")
def get_workout_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    workouts = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id
        )
        .order_by(
            WorkoutSession.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": workout.id,
            "exercise": workout.exercise,
            "reps": workout.reps,
            "form_score": workout.form_score,
            "duration_seconds": workout.duration_seconds,
            "calories_burned": workout.calories_burned,
            "created_at": workout.created_at
        }
        for workout in workouts
    ]


# -----------------------------
# Workout summary
# -----------------------------

@router.get("/summary")
def get_workout_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    workouts = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id
        )
        .all()
    )

    total_workouts = len(workouts)

    total_reps = sum(
        workout.reps for workout in workouts
    )

    total_calories = sum(
        workout.calories_burned
        for workout in workouts
    )

    total_duration = sum(
        workout.duration_seconds
        for workout in workouts
    )

    if total_workouts > 0:

        average_form_score = (
            sum(
                workout.form_score
                for workout in workouts
            )
            / total_workouts
        )

        best_form_score = max(
            workout.form_score
            for workout in workouts
        )

    else:

        average_form_score = 0
        best_form_score = 0

    return {
        "total_workouts": total_workouts,
        "total_reps": total_reps,
        "total_calories": round(
            total_calories,
            2
        ),
        "average_form_score": round(
            average_form_score,
            2
        ),
        "best_form_score": round(
            best_form_score,
            2
        ),
        "total_duration_seconds": total_duration
    }