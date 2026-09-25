from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, date

from ..database import get_db
from ..models import User, NutritionLog
from .auth import get_current_user


router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition Tracking"]
)


class NutritionLogRequest(BaseModel):
    food_name: str
    calories: float
    protein: float = 0
    carbs: float = 0
    fats: float = 0


@router.post("/log")
def log_food(
    data: NutritionLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    nutrition = NutritionLog(
        user_id=current_user.id,
        food_name=data.food_name,
        calories=data.calories,
        protein=data.protein,
        carbs=data.carbs,
        fats=data.fats
    )

    db.add(nutrition)
    db.commit()
    db.refresh(nutrition)

    return {
        "success": True,
        "message": "Food logged successfully",
        "log": {
            "id": nutrition.id,
            "food_name": nutrition.food_name,
            "calories": nutrition.calories,
            "protein": nutrition.protein,
            "carbs": nutrition.carbs,
            "fats": nutrition.fats,
            "created_at": nutrition.created_at
        }
    }


@router.get("/logs")
def get_nutrition_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = (
        db.query(NutritionLog)
        .filter(NutritionLog.user_id == current_user.id)
        .order_by(NutritionLog.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(logs),
        "logs": [
            {
                "id": log.id,
                "food_name": log.food_name,
                "calories": log.calories,
                "protein": log.protein,
                "carbs": log.carbs,
                "fats": log.fats,
                "created_at": log.created_at
            }
            for log in logs
        ]
    }


@router.get("/summary")
def nutrition_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = (
        db.query(NutritionLog)
        .filter(NutritionLog.user_id == current_user.id)
        .all()
    )

    today = date.today()

    today_logs = [
        log for log in logs
        if log.created_at and log.created_at.date() == today
    ]

    total_calories = sum(
        log.calories or 0
        for log in today_logs
    )

    total_protein = sum(
        log.protein or 0
        for log in today_logs
    )

    total_carbs = sum(
        log.carbs or 0
        for log in today_logs
    )

    total_fats = sum(
        log.fats or 0
        for log in today_logs
    )

    return {
        "success": True,
        "date": str(today),
        "total_calories": round(total_calories, 2),
        "total_protein": round(total_protein, 2),
        "total_carbs": round(total_carbs, 2),
        "total_fats": round(total_fats, 2),
        "food_entries": len(today_logs)
    }