from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models

from .api.auth import router as auth_router
from .api.fitness import router as fitness_router
from .api.diet import router as diet_router
from .api.trainer import router as trainer_router
from .api.workouts import router as workouts_router
from .api.buddy import router as buddy_router
from .api.habits import router as habits_router
from .api.gyms import router as gyms_router
from .api.admin import router as admin_router
from .api.notifications import router as notifications_router
from .api.nutrition import router as nutrition_router
from .api.storage import router as storage_router
from .api.planner import router as planner_router
from .api.challenges import router as challenges_router
from .api.iot import router as iot_router


app = FastAPI(
    title="AI Gym & Fitness Assistant API",
    description="AI-powered personal fitness management system",
    version="1.0.0"
)


# --------------------------------------------------
# Create Database Tables
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# Include API Routers
# --------------------------------------------------

app.include_router(auth_router)
app.include_router(fitness_router)
app.include_router(diet_router)
app.include_router(trainer_router)
app.include_router(workouts_router)
app.include_router(buddy_router)
app.include_router(habits_router)
app.include_router(gyms_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(nutrition_router)
app.include_router(storage_router)
app.include_router(planner_router)
app.include_router(challenges_router)
app.include_router(iot_router)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "https://ai-gym-fitness-assistant-smoky.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "AI Gym & Fitness Assistant API is running",
        "status": "success"
    }


# --------------------------------------------------
# Health Endpoint
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }