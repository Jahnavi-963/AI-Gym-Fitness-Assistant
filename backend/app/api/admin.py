from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, WorkoutSession, NutritionLog
from .auth import get_current_user


router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"]
)


# -----------------------------
# Admin authorization
# -----------------------------

def require_admin(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


# -----------------------------
# Admin Dashboard
# -----------------------------

@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):

    # -----------------------------
    # Basic user statistics
    # -----------------------------

    total_users = db.query(User).count()

    # Users created within the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    active_users = (
        db.query(User)
        .filter(
            User.created_at >= thirty_days_ago
        )
        .count()
    )

    # -----------------------------
    # Workout statistics
    # -----------------------------

    total_workouts = (
        db.query(WorkoutSession).count()
    )

    total_reps = (
        db.query(
            func.coalesce(
                func.sum(WorkoutSession.reps),
                0
            )
        ).scalar()
    )

    total_calories = (
        db.query(
            func.coalesce(
                func.sum(
                    WorkoutSession.calories_burned
                ),
                0
            )
        ).scalar()
    )

    average_form = (
        db.query(
            func.coalesce(
                func.avg(
                    WorkoutSession.form_score
                ),
                0
            )
        ).scalar()
    )

    total_duration = (
        db.query(
            func.coalesce(
                func.sum(
                    WorkoutSession.duration_seconds
                ),
                0
            )
        ).scalar()
    )

    best_form = (
        db.query(
            func.coalesce(
                func.max(
                    WorkoutSession.form_score
                ),
                0
            )
        ).scalar()
    )

    # -----------------------------
    # Exercise usage
    # -----------------------------

    exercise_rows = (
        db.query(
            WorkoutSession.exercise,
            func.count(
                WorkoutSession.id
            ).label("sessions"),
            func.sum(
                WorkoutSession.reps
            ).label("reps"),
            func.avg(
                WorkoutSession.form_score
            ).label("average_score")
        )
        .group_by(
            WorkoutSession.exercise
        )
        .all()
    )

    exercise_usage = [
        {
            "exercise": row.exercise,
            "sessions": row.sessions,
            "reps": row.reps or 0,
            "average_score":
                round(
                    float(row.average_score or 0),
                    2
                )
        }
        for row in exercise_rows
    ]

    # -----------------------------
    # Nutrition / Diet usage
    # -----------------------------

    nutrition_logs = (
        db.query(NutritionLog).count()
    )

    nutrition_users = (
        db.query(
            func.count(
                func.distinct(
                    NutritionLog.user_id
                )
            )
        ).scalar()
    )

    total_nutrition_calories = (
        db.query(
            func.coalesce(
                func.sum(
                    NutritionLog.calories
                ),
                0
            )
        ).scalar()
    )

    diet_usage = {
        "nutrition_logs": nutrition_logs,
        "users_tracking_nutrition":
            nutrition_users or 0,
        "total_logged_calories":
            round(
                float(
                    total_nutrition_calories or 0
                ),
                2
            )
    }

    # -----------------------------
    # Fitness goal statistics
    # -----------------------------

    goal_rows = (
        db.query(
            User.fitness_goal,
            func.count(User.id).label("users")
        )
        .group_by(
            User.fitness_goal
        )
        .all()
    )

    fitness_goal_usage = [
        {
            "fitness_goal":
                row.fitness_goal or "Not specified",
            "users": row.users
        }
        for row in goal_rows
    ]

    # -----------------------------
    # Activity level statistics
    # -----------------------------

    activity_rows = (
        db.query(
            User.activity_level,
            func.count(User.id).label("users")
        )
        .group_by(
            User.activity_level
        )
        .all()
    )

    activity_level_usage = [
        {
            "activity_level":
                row.activity_level or "Not specified",
            "users": row.users
        }
        for row in activity_rows
    ]

    # -----------------------------
    # Recent workout activity
    # -----------------------------

    recent_workouts = (
        db.query(
            WorkoutSession,
            User
        )
        .join(
            User,
            WorkoutSession.user_id == User.id
        )
        .order_by(
            WorkoutSession.created_at.desc()
        )
        .limit(10)
        .all()
    )

    recent_activity = [
        {
            "user_name": user.name,
            "exercise": workout.exercise,
            "reps": workout.reps,
            "form_score": workout.form_score,
            "calories_burned":
                workout.calories_burned,
            "duration_seconds":
                workout.duration_seconds,
            "created_at":
                workout.created_at
        }
        for workout, user in recent_workouts
    ]

    # -----------------------------
    # Performance trend
    # -----------------------------

    performance_trend = []

    for workout, user in recent_workouts:
        performance_trend.append(
            {
                "date":
                    workout.created_at,
                "form_score":
                    workout.form_score,
                "exercise":
                    workout.exercise
            }
        )

    # -----------------------------
    # System activity
    # -----------------------------

    system_activity = {
        "total_users": total_users,
        "total_workouts": total_workouts,
        "total_nutrition_logs":
            nutrition_logs,
        "total_exercises":
            len(exercise_usage),
        "admin_access": True
    }

    # -----------------------------
    # Return dashboard data
    # -----------------------------

    return {
        "total_users":
            total_users,

        "active_users":
            active_users,

        "total_workouts":
            total_workouts,

        "total_reps":
            total_reps,

        "total_calories":
            round(
                float(total_calories or 0),
                2
            ),

        "average_form_score":
            round(
                float(average_form or 0),
                2
            ),

        "best_form_score":
            round(
                float(best_form or 0),
                2
            ),

        "total_duration_seconds":
            int(total_duration or 0),

        "exercise_usage":
            exercise_usage,

        "diet_usage":
            diet_usage,

        "fitness_goal_usage":
            fitness_goal_usage,

        "activity_level_usage":
            activity_level_usage,

        "performance_trend":
            performance_trend,

        "recent_activity":
            recent_activity,

        "system_activity":
            system_activity,

        # Development-ready IoT architecture
        "iot_equipment_status": {
            "total_equipment": 4,
            "active": 2,
            "idle": 1,
            "maintenance": 1,
            "integration": "MQTT / Node-RED ready"
        }
    }