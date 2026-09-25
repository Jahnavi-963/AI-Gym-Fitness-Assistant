from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, WorkoutSession
from .auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate personalized fitness notifications.

    Notification types:
    - Workout reminders
    - Missed workout reminders
    - Habit reminders
    - Motivational messages
    - Progress achievements
    - Nutrition reminders
    - AI fitness insights

    Designed so email/push notification services can be
    integrated later without changing the main API.
    """

    notifications = []

    # --------------------------------------------------
    # Get user workouts
    # --------------------------------------------------

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

    now = datetime.utcnow()

    # --------------------------------------------------
    # Calculate workout information
    # --------------------------------------------------

    total_workouts = len(workouts)

    total_reps = sum(
        workout.reps or 0
        for workout in workouts
    )

    total_calories = sum(
        workout.calories_burned or 0
        for workout in workouts
    )

    if workouts:
        latest_workout = workouts[0]
        days_since_workout = (
            now - latest_workout.created_at
        ).days
    else:
        latest_workout = None
        days_since_workout = None

    # --------------------------------------------------
    # 1. Workout Reminder
    # --------------------------------------------------

    if not workouts:

        notifications.append({
            "id": 1,
            "title": "Start your fitness journey",
            "message": (
                "You have no recorded workouts yet. "
                "Start your first workout today!"
            ),
            "type": "workout_reminder",
            "priority": "high",
            "read": False
        })

    elif days_since_workout is not None and days_since_workout >= 1:

        notifications.append({
            "id": 1,
            "title": "Workout reminder",
            "message": (
                "It has been a while since your last workout. "
                "Consider completing a workout today."
            ),
            "type": "workout_reminder",
            "priority": "high",
            "read": False
        })

    else:

        notifications.append({
            "id": 1,
            "title": "Workout reminder",
            "message": (
                f"Your latest workout was "
                f"{latest_workout.exercise}. "
                "Keep training consistently toward your fitness goal."
            ),
            "type": "workout_reminder",
            "priority": "normal",
            "read": False
        })

    # --------------------------------------------------
    # 2. Missed Workout Reminder
    # --------------------------------------------------

    if days_since_workout is not None and days_since_workout >= 3:

        notifications.append({
            "id": 2,
            "title": "Missed workout reminder",
            "message": (
                "You have not recorded a workout for "
                f"{days_since_workout} days. "
                "A short workout can help you get back on track."
            ),
            "type": "missed_workout",
            "priority": "high",
            "read": False
        })

    elif not workouts:

        notifications.append({
            "id": 2,
            "title": "Workout reminder",
            "message": (
                "Schedule your first workout to begin "
                "building a consistent fitness routine."
            ),
            "type": "missed_workout",
            "priority": "normal",
            "read": False
        })

    else:

        notifications.append({
            "id": 2,
            "title": "Workout consistency",
            "message": (
                "Keep following your workout schedule "
                "and avoid long gaps between sessions."
            ),
            "type": "missed_workout",
            "priority": "normal",
            "read": True
        })

    # --------------------------------------------------
    # 3. Habit Reminder
    # --------------------------------------------------

    if total_workouts >= 5:

        habit_message = (
            "Great job! You are building a consistent "
            "workout habit. Keep maintaining your routine."
        )

        habit_read = False

    elif total_workouts >= 3:

        habit_message = (
            "You are making progress with your workout habit. "
            "Try to maintain your consistency this week."
        )

        habit_read = False

    else:

        habit_message = (
            "Consistency is important. Try to complete more "
            "workouts this week to build a strong fitness habit."
        )

        habit_read = True

    notifications.append({
        "id": 3,
        "title": "Habit reminder",
        "message": habit_message,
        "type": "habit_reminder",
        "priority": "normal",
        "read": habit_read
    })

    # --------------------------------------------------
    # 4. Motivational Message
    # --------------------------------------------------

    if total_workouts == 0:

        motivational_message = (
            "Every fitness journey starts with one workout. "
            "Take the first step today!"
        )

    elif total_workouts < 5:

        motivational_message = (
            "You have already started your fitness journey. "
            "Keep going and stay consistent!"
        )

    elif total_reps >= 500:

        motivational_message = (
            "Amazing effort! You have completed more than "
            "500 total reps. Keep challenging yourself safely."
        )

    else:

        motivational_message = (
            "Great work! Stay consistent, focus on good form, "
            "and keep moving toward your fitness goals."
        )

    notifications.append({
        "id": 4,
        "title": "Daily motivation",
        "message": motivational_message,
        "type": "motivation",
        "priority": "normal",
        "read": False
    })

    # --------------------------------------------------
    # 5. Progress Achievement
    # --------------------------------------------------

    if total_workouts >= 50:

        achievement_message = (
            "Achievement unlocked! You have completed "
            f"{total_workouts} workouts."
        )

        achievement_available = True

    elif total_workouts >= 25:

        achievement_message = (
            "Great milestone! You have completed "
            f"{total_workouts} workouts."
        )

        achievement_available = True

    elif total_workouts >= 10:

        achievement_message = (
            "Nice progress! You have reached "
            f"{total_workouts} recorded workouts."
        )

        achievement_available = True

    else:

        achievement_message = (
            "Keep working toward your next workout milestone."
        )

        achievement_available = False

    notifications.append({
        "id": 5,
        "title": "Progress achievement",
        "message": achievement_message,
        "type": "achievement",
        "priority": "normal",
        "read": not achievement_available
    })

    # --------------------------------------------------
    # 6. Nutrition Reminder
    # --------------------------------------------------

    if current_user.weight and current_user.height:

        nutrition_message = (
            "Remember to track your meals and stay close "
            "to your daily calorie target."
        )

    else:

        nutrition_message = (
            "Complete your fitness profile to receive "
            "personalized nutrition recommendations."
        )

    notifications.append({
        "id": 6,
        "title": "Nutrition reminder",
        "message": nutrition_message,
        "type": "nutrition_reminder",
        "priority": "normal",
        "read": True
    })

    # --------------------------------------------------
    # 7. AI Fitness Insight
    # --------------------------------------------------

    if workouts:

        average_form = (
            sum(
                workout.form_score or 0
                for workout in workouts
            )
            / len(workouts)
        )

        if average_form >= 80:

            insight = (
                "Your workout form is looking strong. "
                "Continue focusing on controlled movements."
            )

        elif average_form >= 60:

            insight = (
                "Your form is improving. Focus on controlled "
                "movements and proper exercise technique."
            )

        else:

            insight = (
                "Focus on improving exercise form before "
                "increasing workout intensity."
            )

    else:

        average_form = 0

        insight = (
            "Complete your first workout to receive "
            "AI-powered performance insights."
        )

    notifications.append({
        "id": 7,
        "title": "AI Fitness Insight",
        "message": insight,
        "type": "ai_insight",
        "priority": "normal",
        "read": True
    })

    # --------------------------------------------------
    # Notification summary
    # --------------------------------------------------

    unread_count = sum(
        1
        for notification in notifications
        if not notification["read"]
    )

    high_priority_count = sum(
        1
        for notification in notifications
        if notification["priority"] == "high"
    )

    # --------------------------------------------------
    # Future notification architecture
    # --------------------------------------------------

    delivery_channels = {
        "in_app": True,
        "browser": True,
        "email": False,
        "push": False
    }

    return {
        "success": True,

        "count": len(notifications),

        "unread_count": unread_count,

        "high_priority_count": high_priority_count,

        "user_summary": {
            "total_workouts": total_workouts,
            "total_reps": total_reps,
            "total_calories": round(
                total_calories,
                2
            ),
            "average_form_score": round(
                average_form,
                2
            ),
            "days_since_workout": days_since_workout
        },

        "notifications": notifications,

        "delivery_channels": delivery_channels,

        "integration_status": {
            "in_app": "ready",
            "browser": "ready",
            "email": "integration-ready",
            "push": "integration-ready"
        },

        "generated_at": now.isoformat()
    }