from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime

from .database import Base


# ==================================================
# USER
# ==================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(String, nullable=False)

    age = Column(Integer, nullable=True)

    gender = Column(String, nullable=True)

    height = Column(Float, nullable=True)

    weight = Column(Float, nullable=True)

    fitness_goal = Column(String, nullable=True)

    activity_level = Column(String, nullable=True)

    is_admin = Column(Boolean, default=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# PROFILE
# ==================================================

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    dietary_preference = Column(
        String,
        nullable=True
    )

    fitness_level = Column(
        String,
        nullable=True
    )

    workout_preferences = Column(
        Text,
        nullable=True
    )

    bmi = Column(
        Float,
        nullable=True
    )

    bmi_category = Column(
        String,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# ==================================================
# EXERCISE
# ==================================================

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    target_muscle_group = Column(
        String,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    difficulty = Column(
        String,
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True
    )


# ==================================================
# WORKOUT SESSION
# ==================================================

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    exercise = Column(
        String,
        nullable=False
    )

    reps = Column(
        Integer,
        default=0
    )

    form_score = Column(
        Float,
        default=0
    )

    duration_seconds = Column(
        Integer,
        default=0
    )

    calories_burned = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# REP COUNT
# ==================================================

class RepCount(Base):
    __tablename__ = "rep_counts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    workout_session_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    exercise = Column(
        String,
        nullable=False
    )

    reps = Column(
        Integer,
        default=0
    )

    correct_reps = Column(
        Integer,
        default=0
    )

    incorrect_reps = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# PERFORMANCE SCORE
# ==================================================

class PerformanceScore(Base):
    __tablename__ = "performance_scores"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    exercise = Column(
        String,
        nullable=True
    )

    form_accuracy = Column(
        Float,
        default=0
    )

    rep_consistency = Column(
        Float,
        default=0
    )

    range_of_motion = Column(
        Float,
        default=0
    )

    movement_stability = Column(
        Float,
        default=0
    )

    tempo_consistency = Column(
        Float,
        default=0
    )

    overall_score = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# DIET PLAN
# ==================================================

class DietPlan(Base):
    __tablename__ = "diet_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    fitness_goal = Column(
        String,
        nullable=True
    )

    dietary_preference = Column(
        String,
        nullable=True
    )

    daily_calories = Column(
        Float,
        default=0
    )

    plan_data = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# MEAL
# ==================================================

class Meal(Base):
    __tablename__ = "meals"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    diet_plan_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    meal_type = Column(
        String,
        nullable=True
    )

    food_name = Column(
        String,
        nullable=False
    )

    calories = Column(
        Float,
        default=0
    )

    protein = Column(
        Float,
        default=0
    )

    carbs = Column(
        Float,
        default=0
    )

    fats = Column(
        Float,
        default=0
    )


# ==================================================
# NUTRITION LOG
# ==================================================

class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    food_name = Column(
        String,
        nullable=False
    )

    calories = Column(
        Float,
        nullable=False
    )

    protein = Column(
        Float,
        default=0
    )

    carbs = Column(
        Float,
        default=0
    )

    fats = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# GROCERY LIST
# ==================================================

class GroceryList(Base):
    __tablename__ = "grocery_lists"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    diet_plan_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    item_name = Column(
        String,
        nullable=False
    )

    quantity = Column(
        String,
        nullable=True
    )

    is_purchased = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# HABIT
# ==================================================

class Habit(Base):
    __tablename__ = "habits"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    workout_frequency = Column(
        Integer,
        default=0
    )

    completed_workouts = Column(
        Integer,
        default=0
    )

    missed_workouts = Column(
        Integer,
        default=0
    )

    total_duration_seconds = Column(
        Integer,
        default=0
    )

    current_streak = Column(
        Integer,
        default=0
    )

    weekly_consistency_score = Column(
        Float,
        default=0
    )

    habit_score = Column(
        Float,
        default=0
    )

    last_workout_at = Column(
        DateTime,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# ==================================================
# CHAT HISTORY
# ==================================================

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    message = Column(
        Text,
        nullable=False
    )

    response = Column(
        Text,
        nullable=True
    )

    sentiment = Column(
        String,
        nullable=True
    )

    emotional_state = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# RECOMMENDATION
# ==================================================

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    recommendation_type = Column(
        String,
        nullable=True
    )

    title = Column(
        String,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# GYM
# ==================================================

class Gym(Base):
    __tablename__ = "gyms"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    city = Column(
        String,
        nullable=True
    )

    address = Column(
        String,
        nullable=True
    )

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )

    rating = Column(
        Float,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# IOT EQUIPMENT
# ==================================================

class IoTEquipment(Base):
    __tablename__ = "iot_equipment"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    equipment_name = Column(
        String,
        nullable=False
    )

    equipment_type = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="idle"
    )

    resistance_level = Column(
        Float,
        default=0
    )

    heart_rate = Column(
        Float,
        default=0
    )

    temperature = Column(
        Float,
        default=0
    )

    mqtt_topic = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# NOTIFICATION
# ==================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    notification_type = Column(
        String,
        nullable=False
    )

    title = Column(
        String,
        nullable=True
    )

    message = Column(
        Text,
        nullable=False
    )

    priority = Column(
        String,
        default="normal"
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# WORKOUT PLANNER
# ==================================================

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    fitness_goal = Column(
        String,
        nullable=True
    )

    fitness_level = Column(
        String,
        nullable=True
    )

    available_days = Column(
        String,
        nullable=True
    )

    workout_duration = Column(
        Integer,
        default=30
    )

    preferred_exercises = Column(
        Text,
        nullable=True
    )

    plan_data = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# WORKOUT PLAN EXERCISE
# ==================================================

class WorkoutPlanExercise(Base):
    __tablename__ = "workout_plan_exercises"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    workout_plan_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    day = Column(
        String,
        nullable=True
    )

    exercise = Column(
        String,
        nullable=False
    )

    sets = Column(
        Integer,
        default=0
    )

    reps = Column(
        Integer,
        default=0
    )

    rest_seconds = Column(
        Integer,
        default=0
    )

    duration_minutes = Column(
        Integer,
        default=0
    )

    target_muscle_group = Column(
        String,
        nullable=True
    )

    is_completed = Column(
        Boolean,
        default=False
    )


# ==================================================
# CHALLENGE
# ==================================================

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    duration_days = Column(
        Integer,
        default=7
    )

    target = Column(
        String,
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True
    )


# ==================================================
# USER CHALLENGE
# ==================================================

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    challenge_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    progress = Column(
        Float,
        default=0
    )

    completed = Column(
        Boolean,
        default=False
    )

    joined_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==================================================
# ADMIN ANALYTICS
# ==================================================

class AdminAnalytics(Base):
    __tablename__ = "admin_analytics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    metric_name = Column(
        String,
        nullable=False
    )

    metric_value = Column(
        Float,
        default=0
    )

    metric_category = Column(
        String,
        nullable=True
    )

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )