from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import WorkoutPlan, WorkoutPlanExercise
from ..api.auth import get_current_user


router = APIRouter(
    prefix="/planner",
    tags=["Workout Planner"]
)


class WorkoutPlanCreate(BaseModel):
    fitness_goal: str
    fitness_level: str
    available_days: str
    workout_duration: int = Field(..., ge=10, le=180)
    preferred_exercises: Optional[list[str]] = None
    plan_data: Optional[str] = None


class WorkoutExerciseCreate(BaseModel):
    day: Optional[str] = None
    exercise: str
    sets: int = Field(..., ge=1, le=20)
    reps: int = Field(..., ge=1, le=100)
    rest_seconds: int = Field(..., ge=0, le=600)
    duration_minutes: int = Field(..., ge=1, le=180)
    target_muscle_group: Optional[str] = None


class ExerciseCompletion(BaseModel):
    is_completed: bool


@router.post("/plans")
def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = WorkoutPlan(
        user_id=current_user.id,
        fitness_goal=plan_data.fitness_goal,
        fitness_level=plan_data.fitness_level,
        available_days=plan_data.available_days,
        workout_duration=plan_data.workout_duration,
        preferred_exercises=", ".join(
            plan_data.preferred_exercises or []
        ),
        plan_data=plan_data.plan_data,
        created_at=datetime.utcnow()
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {
        "message": "Workout plan created successfully",
        "plan": {
            "id": plan.id,
            "fitness_goal": plan.fitness_goal,
            "fitness_level": plan.fitness_level,
            "available_days": plan.available_days,
            "workout_duration": plan.workout_duration,
            "preferred_exercises": plan.preferred_exercises,
            "plan_data": plan.plan_data
        }
    }


@router.post("/plans/{plan_id}/exercises")
def add_plan_exercise(
    plan_id: int,
    exercise_data: WorkoutExerciseCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Workout plan not found"
        )

    exercise = WorkoutPlanExercise(
        workout_plan_id=plan_id,
        day=exercise_data.day,
        exercise=exercise_data.exercise,
        sets=exercise_data.sets,
        reps=exercise_data.reps,
        rest_seconds=exercise_data.rest_seconds,
        duration_minutes=exercise_data.duration_minutes,
        target_muscle_group=exercise_data.target_muscle_group
    )

    db.add(exercise)
    db.commit()
    db.refresh(exercise)

    return {
        "message": "Exercise added to workout plan",
        "exercise": {
            "id": exercise.id,
            "day": exercise.day,
            "exercise": exercise.exercise,
            "sets": exercise.sets,
            "reps": exercise.reps,
            "rest_seconds": exercise.rest_seconds,
            "duration_minutes": exercise.duration_minutes,
            "target_muscle_group": exercise.target_muscle_group,
            "is_completed": exercise.is_completed
        }
    }


@router.get("/plans")
def get_workout_plans(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plans = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id
        )
        .all()
    )

    result = []

    for plan in plans:

        exercises = (
            db.query(WorkoutPlanExercise)
            .filter(
                WorkoutPlanExercise.workout_plan_id == plan.id
            )
            .all()
        )

        result.append({
            "id": plan.id,
            "fitness_goal": plan.fitness_goal,
            "fitness_level": plan.fitness_level,
            "available_days": plan.available_days,
            "workout_duration": plan.workout_duration,
            "preferred_exercises": plan.preferred_exercises,
            "plan_data": plan.plan_data,
            "exercises": [
                {
                    "id": exercise.id,
                    "day": exercise.day,
                    "exercise": exercise.exercise,
                    "sets": exercise.sets,
                    "reps": exercise.reps,
                    "rest_seconds": exercise.rest_seconds,
                    "duration_minutes": exercise.duration_minutes,
                    "target_muscle_group": exercise.target_muscle_group,
                    "is_completed": exercise.is_completed
                }
                for exercise in exercises
            ]
        })

    return {
        "plans": result
    }


@router.put("/exercises/{exercise_id}/complete")
def complete_plan_exercise(
    exercise_id: int,
    completion: ExerciseCompletion,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exercise = (
        db.query(WorkoutPlanExercise)
        .join(
            WorkoutPlan,
            WorkoutPlan.id == WorkoutPlanExercise.workout_plan_id
        )
        .filter(
            WorkoutPlanExercise.id == exercise_id,
            WorkoutPlan.user_id == current_user.id
        )
        .first()
    )

    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Workout exercise not found"
        )

    exercise.is_completed = completion.is_completed

    db.commit()
    db.refresh(exercise)

    return {
        "message": (
            "Exercise marked as completed"
            if completion.is_completed
            else "Exercise marked as incomplete"
        ),
        "exercise_id": exercise.id,
        "is_completed": exercise.is_completed
    }