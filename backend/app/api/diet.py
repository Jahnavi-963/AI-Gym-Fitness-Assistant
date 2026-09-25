from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from .auth import get_current_user


router = APIRouter(
    prefix="/diet",
    tags=["AI Dietician"]
)


# ============================================================
# EXISTING DIET PLAN MODELS
# ============================================================

class DietPlanRequest(BaseModel):
    daily_calories: float
    fitness_goal: str
    diet_preference: str
    meals_per_day: int = 4


class Meal(BaseModel):
    meal_name: str
    foods: list[str]
    calories: int


class DietPlanResponse(BaseModel):
    daily_calories: float
    fitness_goal: str
    diet_preference: str
    meals: list[Meal]
    grocery_list: list[str]


# ============================================================
# NEW NLP DIETICIAN CHAT MODEL
# ============================================================

class DietChatRequest(BaseModel):
    message: str


class DietChatResponse(BaseModel):
    message: str
    detected_goal: str
    detected_preference: str
    recommendation: str
    suggested_foods: list[str]


# ============================================================
# HELPER: CREATE DIET INFORMATION
# ============================================================

def build_food_recommendation(
    goal: str,
    preference: str
):
    goal = goal.lower()
    preference = preference.lower()

    if preference == "vegetarian":
        breakfast = [
            "Oats with milk",
            "Banana",
            "Almonds"
        ]

        lunch = [
            "Brown rice",
            "Dal",
            "Mixed vegetables",
            "Curd"
        ]

        snack = [
            "Apple",
            "Greek yogurt"
        ]

        dinner = [
            "2 Rotis",
            "Paneer",
            "Vegetable salad"
        ]

    elif preference == "vegan":
        breakfast = [
            "Oats with soy milk",
            "Banana",
            "Peanut butter"
        ]

        lunch = [
            "Brown rice",
            "Chickpeas",
            "Mixed vegetables"
        ]

        snack = [
            "Apple",
            "Mixed nuts"
        ]

        dinner = [
            "2 Rotis",
            "Tofu",
            "Vegetable salad"
        ]

    else:
        breakfast = [
            "Oats with milk",
            "2 Eggs",
            "Banana"
        ]

        lunch = [
            "Brown rice",
            "Grilled chicken",
            "Mixed vegetables",
            "Curd"
        ]

        snack = [
            "Apple",
            "Greek yogurt"
        ]

        dinner = [
            "2 Rotis",
            "Grilled chicken",
            "Vegetable salad"
        ]

    # Goal-specific adjustments
    if goal == "muscle_gain":
        breakfast.append("Protein shake")
        snack.append("Peanut butter")

    elif goal == "weight_loss":
        snack = [
            "Apple",
            "Green tea"
        ]

    foods = (
        breakfast
        + lunch
        + snack
        + dinner
    )

    return sorted(set(foods))


# ============================================================
# EXISTING DIET PLAN ENDPOINT
# ============================================================

@router.post(
    "/plan",
    response_model=DietPlanResponse
)
def create_diet_plan(
    data: DietPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    calories = data.daily_calories
    goal = data.fitness_goal.lower()
    preference = data.diet_preference.lower()

    breakfast_calories = int(
        calories * 0.25
    )

    lunch_calories = int(
        calories * 0.30
    )

    snack_calories = int(
        calories * 0.15
    )

    dinner_calories = int(
        calories * 0.30
    )

    if preference == "vegetarian":

        breakfast_foods = [
            "Oats with milk",
            "Banana",
            "Almonds"
        ]

        lunch_foods = [
            "Brown rice",
            "Dal",
            "Mixed vegetables",
            "Curd"
        ]

        snack_foods = [
            "Apple",
            "Greek yogurt"
        ]

        dinner_foods = [
            "2 Rotis",
            "Paneer",
            "Vegetable salad"
        ]

    elif preference == "vegan":

        breakfast_foods = [
            "Oats with soy milk",
            "Banana",
            "Peanut butter"
        ]

        lunch_foods = [
            "Brown rice",
            "Chickpeas",
            "Mixed vegetables"
        ]

        snack_foods = [
            "Apple",
            "Mixed nuts"
        ]

        dinner_foods = [
            "2 Rotis",
            "Tofu",
            "Vegetable salad"
        ]

    else:

        breakfast_foods = [
            "Oats with milk",
            "2 Eggs",
            "Banana"
        ]

        lunch_foods = [
            "Brown rice",
            "Grilled chicken",
            "Mixed vegetables",
            "Curd"
        ]

        snack_foods = [
            "Apple",
            "Greek yogurt"
        ]

        dinner_foods = [
            "2 Rotis",
            "Grilled chicken",
            "Vegetable salad"
        ]

    if goal == "muscle_gain":

        breakfast_foods.append(
            "Protein shake"
        )

        snack_foods.append(
            "Peanut butter"
        )

    elif goal == "weight_loss":

        snack_foods = [
            "Apple",
            "Green tea"
        ]

    meals = [

        Meal(
            meal_name="Breakfast",
            foods=breakfast_foods,
            calories=breakfast_calories
        ),

        Meal(
            meal_name="Lunch",
            foods=lunch_foods,
            calories=lunch_calories
        ),

        Meal(
            meal_name="Snack",
            foods=snack_foods,
            calories=snack_calories
        ),

        Meal(
            meal_name="Dinner",
            foods=dinner_foods,
            calories=dinner_calories
        )
    ]

    grocery_list = sorted(
        set(
            food
            for meal in meals
            for food in meal.foods
        )
    )

    return DietPlanResponse(
        daily_calories=calories,
        fitness_goal=data.fitness_goal,
        diet_preference=data.diet_preference,
        meals=meals,
        grocery_list=grocery_list
    )


# ============================================================
# NLP INTENT DETECTION
# ============================================================

def detect_goal(message: str) -> str:

    text = message.lower()

    if any(
        word in text
        for word in [
            "lose weight",
            "weight loss",
            "fat loss",
            "lose fat",
            "slim"
        ]
    ):
        return "weight_loss"

    if any(
        word in text
        for word in [
            "gain muscle",
            "muscle gain",
            "build muscle",
            "bulk",
            "muscle"
        ]
    ):
        return "muscle_gain"

    if any(
        word in text
        for word in [
            "maintain",
            "maintenance",
            "healthy diet"
        ]
    ):
        return "maintenance"

    return "general"


def detect_preference(message: str) -> str:

    text = message.lower()

    if any(
        word in text
        for word in [
            "vegetarian",
            "veg diet"
        ]
    ):
        return "vegetarian"

    if "vegan" in text:
        return "vegan"

    if any(
        word in text
        for word in [
            "non vegetarian",
            "non-vegetarian",
            "chicken",
            "eggs",
            "meat"
        ]
    ):
        return "non_vegetarian"

    return "general"


# ============================================================
# NLP DIETICIAN CHATBOT
# ============================================================

@router.post(
    "/chat",
    response_model=DietChatResponse
)
def dietician_chat(
    data: DietChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    message = data.message.strip()

    if not message:
        return DietChatResponse(
            message=(
                "Please tell me your fitness goal or "
                "diet preference so I can help you."
            ),
            detected_goal="general",
            detected_preference="general",
            recommendation=(
                "Tell me whether you want weight loss, "
                "muscle gain, or a balanced diet."
            ),
            suggested_foods=[]
        )

    goal = detect_goal(message)
    preference = detect_preference(message)

    # Use user's stored profile when the message
    # does not explicitly specify the goal.
    if goal == "general":

        user_goal = getattr(
            current_user,
            "fitness_goal",
            None
        )

        if user_goal:
            goal = str(
                user_goal
            ).lower()

    # Use a default balanced preference
    # when the user does not specify one.
    if preference == "general":

        preference = "general"

    foods = build_food_recommendation(
        goal,
        preference
    )

    # Goal-specific conversational response
    if goal == "weight_loss":

        recommendation = (
            "For weight loss, focus on balanced meals "
            "with vegetables, protein, whole grains, "
            "and controlled portions. Avoid excessive "
            "sugary drinks and highly processed foods."
        )

    elif goal == "muscle_gain":

        recommendation = (
            "For muscle gain, focus on sufficient "
            "protein, balanced carbohydrates, healthy "
            "fats, hydration, and regular resistance "
            "training."
        )

    elif goal == "maintenance":

        recommendation = (
            "For maintaining your current weight, "
            "aim for balanced meals with adequate "
            "protein, vegetables, whole grains, "
            "healthy fats, and regular activity."
        )

    else:

        recommendation = (
            "A balanced diet with adequate protein, "
            "vegetables, fruits, whole grains, healthy "
            "fats, and good hydration is a good starting point."
        )

    # Preference-specific response
    if preference == "vegetarian":

        recommendation += (
            " Since you prefer vegetarian food, "
            "include protein sources such as dal, "
            "paneer, curd, Greek yogurt, and nuts."
        )

    elif preference == "vegan":

        recommendation += (
            " Since you prefer vegan food, consider "
            "plant-based protein sources such as "
            "tofu, chickpeas, beans, soy milk, "
            "and nuts."
        )

    return DietChatResponse(

        message=(
            "I understood your diet request and "
            "prepared a personalized recommendation."
        ),

        detected_goal=goal,

        detected_preference=preference,

        recommendation=recommendation,

        suggested_foods=foods[:12]
    )