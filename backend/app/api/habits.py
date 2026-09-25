from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, WorkoutSession
from ..services.behavior_model import workout_skip_predictor
from .auth import get_current_user


router = APIRouter(
    prefix="/habits",
    tags=["AI Fitness Habit Tracker"]
)


@router.get("/summary")
def get_habit_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workouts = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.created_at.desc())
        .all()
    )

    total_workouts = len(workouts)

    # ---------------------------------------------------------
    # No workout history
    # ---------------------------------------------------------

    if total_workouts == 0:
        return {
            "total_workouts": 0,
            "workout_frequency": 0,
            "current_streak": 0,
            "habit_status": "Getting Started",
            "skip_risk": "High",
            "skip_probability": 100,
            "engagement_score": 0,
            "days_since_last_workout": None,
            "average_workout_duration": 30.0,
            "missed_workouts": 7,
            "behavioral_recommendation": (
                "Start your first workout to build enough "
                "activity history for behavioral prediction."
            ),
            "prediction_model": "Logistic Regression",
            "message": (
                "Start your first workout to build your fitness habit."
            )
        }

    # ---------------------------------------------------------
    # Last 7 days
    # ---------------------------------------------------------

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    recent_workouts = [
        workout
        for workout in workouts
        if workout.created_at
        and workout.created_at >= seven_days_ago
    ]

    workout_frequency = len(recent_workouts)

    # ---------------------------------------------------------
    # Current workout streak
    # ---------------------------------------------------------

    workout_dates = sorted(
        {
            workout.created_at.date()
            for workout in workouts
            if workout.created_at
        },
        reverse=True
    )

    current_streak = 0

    if workout_dates:
        current_date = datetime.utcnow().date()

        # Allow today or yesterday as the latest workout date
        if workout_dates[0] >= current_date - timedelta(days=1):
            current_streak = 1

            for i in range(1, len(workout_dates)):
                difference = (
                    workout_dates[i - 1] - workout_dates[i]
                ).days

                if difference == 1:
                    current_streak += 1
                else:
                    break

    # ---------------------------------------------------------
    # Engagement score
    # ---------------------------------------------------------

    frequency_score = min(
        workout_frequency * 15,
        60
    )

    streak_score = min(
        current_streak * 8,
        40
    )

    engagement_score = min(
        frequency_score + streak_score,
        100
    )

    # ---------------------------------------------------------
    # Habit status
    # ---------------------------------------------------------

    if workout_frequency >= 5:
        habit_status = "Excellent"
    elif workout_frequency >= 3:
        habit_status = "Consistent"
    elif workout_frequency >= 1:
        habit_status = "Building Habit"
    else:
        habit_status = "Needs Attention"

    # ---------------------------------------------------------
    # Days since last workout
    # ---------------------------------------------------------

    last_workout = workouts[0]

    if last_workout.created_at:
        days_since_last_workout = (
            datetime.utcnow().date()
            - last_workout.created_at.date()
        ).days
    else:
        days_since_last_workout = 0

    # ---------------------------------------------------------
    # Behavioral AI features
    # ---------------------------------------------------------

    # Number of workout opportunities not completed
    # during the current 7-day period.
    missed_workouts = max(
        0,
        7 - workout_frequency
    )

    # The current WorkoutSession model does not contain
    # duration_minutes, so use a stable baseline duration
    # for the behavioral model.
    #
    # The model's primary behavioral signals are workout
    # frequency, streak, missed workouts and engagement.
    average_duration = 30.0

    # ---------------------------------------------------------
    # Logistic Regression Behavioral AI
    # ---------------------------------------------------------

    behavioral_prediction = workout_skip_predictor.predict(
        weekly_workouts=workout_frequency,
        avg_duration=average_duration,
        streak=current_streak,
        missed_workouts=missed_workouts,
        engagement_score=engagement_score,
    )

    skip_risk = behavioral_prediction["risk_level"]

    skip_probability = behavioral_prediction[
        "skip_probability"
    ]

    behavioral_recommendation = behavioral_prediction[
        "recommendation"
    ]

    # ---------------------------------------------------------
    # Response
    # ---------------------------------------------------------

    return {
        "total_workouts": total_workouts,
        "workout_frequency": workout_frequency,
        "current_streak": current_streak,
        "habit_status": habit_status,
        "skip_risk": skip_risk,
        "skip_probability": skip_probability,
        "engagement_score": engagement_score,
        "days_since_last_workout": days_since_last_workout,
        "average_workout_duration": average_duration,
        "missed_workouts": missed_workouts,
        "behavioral_recommendation": behavioral_recommendation,
        "prediction_model": "Logistic Regression",
        "message": (
            "Great consistency! Keep going."
            if skip_risk == "Low"
            else "A workout today can help maintain your routine."
        )
    }


@router.get("/nudge")
def get_motivation_nudge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workouts = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.created_at.desc())
        .all()
    )

    if not workouts:
        return {
            "type": "start",
            "title": "Start Your Fitness Journey",
            "message": (
                "Complete your first workout and begin "
                "building your fitness habit."
            )
        }

    last_workout = workouts[0]

    days_since_last_workout = (
        datetime.utcnow().date()
        - last_workout.created_at.date()
    ).days

    if days_since_last_workout >= 4:
        return {
            "type": "high_risk",
            "title": "We Missed You! 💪",
            "message": (
                "You have been away from your workouts for "
                "a few days. Start with a short workout today."
            )
        }

    if days_since_last_workout >= 2:
        return {
            "type": "reminder",
            "title": "Time to Move! 🔥",
            "message": (
                "Your body will thank you for a workout today. "
                "Even 20 minutes is a great start."
            )
        }

    return {
        "type": "motivation",
        "title": "Great Job! ⭐",
        "message": (
            "You are staying consistent. Keep pushing "
            "toward your fitness goal!"
        )
    }


@router.get("/schedule")
def get_dynamic_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workouts = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.created_at.desc())
        .all()
    )

    if not workouts:
        return {
            "recommended_days": 3,
            "recommended_duration": 20,
            "intensity": "Beginner",
            "reason": (
                "Start with three short workouts this week."
            )
        }

    recent_workouts = [
        workout
        for workout in workouts
        if workout.created_at
        and workout.created_at >= (
            datetime.utcnow() - timedelta(days=7)
        )
    ]

    workout_count = len(recent_workouts)

    if workout_count >= 5:
        return {
            "recommended_days": 5,
            "recommended_duration": 45,
            "intensity": "Moderate",
            "reason": (
                "Your engagement is strong. You can maintain "
                "a regular workout schedule."
            )
        }

    if workout_count >= 3:
        return {
            "recommended_days": 4,
            "recommended_duration": 35,
            "intensity": "Moderate",
            "reason": (
                "Your current activity is consistent. "
                "Keep a balanced weekly routine."
            )
        }

    return {
        "recommended_days": 3,
        "recommended_duration": 30,
        "intensity": "Light to Moderate",
        "reason": (
            "Gradually increase your workout frequency "
            "to build a sustainable habit."
        )
    }