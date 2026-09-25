from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from .auth import get_current_user


router = APIRouter(
    prefix="/fitness",
    tags=["Fitness"]
)


class FitnessProfileRequest(BaseModel):
    height: float
    weight: float
    age: int
    gender: str
    activity_level: str
    fitness_goal: str


class FitnessProfileResponse(BaseModel):
    bmi: float
    bmi_category: str
    bmr: float
    daily_calories: float
    fitness_goal: str


def calculate_bmi(height: float, weight: float):
    height_m = height / 100
    bmi = weight / (height_m * height_m)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obesity"

    return round(bmi, 2), category


def calculate_bmr(
    weight: float,
    height: float,
    age: int,
    gender: str
):
    if gender.lower() == "male":
        bmr = (
            10 * weight
            + 6.25 * height
            - 5 * age
            + 5
        )
    else:
        bmr = (
            10 * weight
            + 6.25 * height
            - 5 * age
            - 161
        )

    return round(bmr, 2)


def calculate_daily_calories(
    bmr: float,
    activity_level: str,
    fitness_goal: str
):
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }

    multiplier = activity_multipliers.get(
        activity_level.lower(),
        1.2
    )

    calories = bmr * multiplier

    goal = fitness_goal.lower()

    if goal == "weight_loss":
        calories -= 500
    elif goal == "muscle_gain":
        calories += 300

    return round(calories, 2)


@router.post(
    "/calculate",
    response_model=FitnessProfileResponse
)
def calculate_fitness(
    data: FitnessProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bmi, category = calculate_bmi(
        data.height,
        data.weight
    )

    bmr = calculate_bmr(
        data.weight,
        data.height,
        data.age,
        data.gender
    )

    daily_calories = calculate_daily_calories(
        bmr,
        data.activity_level,
        data.fitness_goal
    )

    current_user.height = data.height
    current_user.weight = data.weight
    current_user.age = data.age
    current_user.gender = data.gender
    current_user.activity_level = data.activity_level
    current_user.fitness_goal = data.fitness_goal

    db.commit()

    return {
        "bmi": bmi,
        "bmi_category": category,
        "bmr": bmr,
        "daily_calories": daily_calories,
        "fitness_goal": data.fitness_goal
    }