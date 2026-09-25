AI Gym & Fitness Assistant

Overview

AI Gym & Fitness Assistant is an AI-powered personal fitness management system combining workout assistance, diet guidance, habit tracking, motivation, performance analysis, gym recommendations, workout planning, challenges, notifications, analytics, IoT integration, and an admin dashboard.

Core AI Modules

AI Gym Trainer — MediaPipe pose detection, exercise recognition, repetition counting, body-angle analysis, form feedback, workout duration and calorie estimation. Supported exercises include squats, push-ups, bicep curls, lunges and shoulder press.

AI Dietician & Calorie Coach — BMI, BMR/daily calories, goal-based recommendations, food-preference detection, meal plans, grocery lists, nutrition tracking and NLP diet chat.

Smart Gym Assistant — IoT equipment monitoring, MQTT commands and Node-RED integration.

AI Fitness Habit Tracker — behavioral AI, engagement tracking, streaks, missed-workout tracking, skip-risk prediction, motivation and dynamic scheduling.

Virtual Gym Buddy — conversational AI, workout/nutrition support, motivation, sentiment and emotional-state guidance.

Pose-to-Performance Analyzer — performance score, form score, motion efficiency, repetitions, calories, exercise breakdowns and progress reports.

Gym Recommender & Planner — nearby gym search, goal/activity/history-based recommendations and personalized weekly planning.

Additional Features

JWT authentication and user registration/login

Personal profile and settings

Workout history

Personalized workout planner

Fitness challenges with progress tracking

Notifications

Analytics

Admin dashboard

Storage integration

PostgreSQL main database

SQLite planner database

MQTT + Node-RED

Technology Stack

Frontend: Next.js 16.3.4, React, TypeScript, Tailwind CSS, App Router, MediaPipe Tasks Vision

Backend: Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic, JWT

AI/ML: MediaPipe, scikit-learn, Logistic Regression, NLP/LLM integration

Database: PostgreSQL and SQLite

IoT: MQTT, HiveMQ, Node-RED

Testing: pytest, httpx

Architecture

User/Admin
   |
   v
Next.js Frontend
   |
 REST API / JWT
   |
   v
FastAPI Backend
   |------------------|------------------|
   v                  v                  v
PostgreSQL        SQLite Planner     AI Services
   |
   v
MQTT / HiveMQ
   |
   v
Node-RED

Project Structure

AI-Gym-Fitness-Assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   └── main.py
│   ├── venv/
│   ├── gym_fitness.db
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── buddy/
│   │   ├── challenges/
│   │   ├── diet/
│   │   ├── gyms/
│   │   ├── habits/
│   │   ├── login/
│   │   ├── notifications/
│   │   ├── performance/
│   │   ├── planner/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── settings/
│   │   ├── smart-gym/
│   │   └── trainer/
│   └── public/models/pose_landmarker_lite.task
└── README.md

Run Backend

cd C:\Users\jahna\Downloads\AI-Gym-Fitness-Assistant\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload

Backend: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

Run Frontend

cd C:\Users\jahna\Downloads\AI-Gym-Fitness-Assistant\frontend
npm install
npm run dev

Frontend: http://localhost:3000

Run Node-RED

node-red

Node-RED: http://127.0.0.1:1880/

MQTT broker: broker.hivemq.com:1883
MQTT topic: ai-gym-fitness/smart-gym

Important APIs

POST /auth/register
POST /auth/login
GET  /auth/me

POST /fitness/calculate
POST /diet/plan
POST /diet/chat
GET  /habits/summary
GET  /gyms/recommend

GET  /planner/plans
POST /planner/plans
POST /planner/plans/{plan_id}/exercises
PUT  /planner/exercises/{exercise_id}/complete

GET  /challenges/
POST /challenges/
POST /challenges/join
PUT  /challenges/{challenge_id}/progress

GET  /iot/mqtt/status
POST /iot/mqtt/publish
GET  /storage/status

Frontend Routes

/ /admin /analytics /buddy /challenges /diet /gyms /habits
/login /notifications /performance /planner /profile /register
/settings /smart-gym /trainer

Database

PostgreSQL is the main application database. SQLite is currently used by the workout planner at:

backend/gym_fitness.db

A planner backup exists at:

backend/gym_fitness_backup_before_cleanup.db

Storage

The current development configuration uses local storage fallback. AWS S3 integration is prepared but production bucket credentials are not configured.

IoT

Example MQTT message:

{
  "equipment": "treadmill_01",
  "action": "set_speed",
  "value": 6
}

AI/ML

MediaPipe: pose detection and workout analysis

Logistic Regression: workout skip-risk prediction

NLP: fitness-goal and food-preference detection

LLM integration: Virtual Gym Buddy

Testing

Backend automated tests:

14 passed
2 warnings

Frontend production build:

npm run build

The production build completed successfully.

Verification Status

Module / Requirement

Status

AI Gym Trainer

PASS

AI Dietician

PASS

NLP Diet Chatbot

PASS

Nutrition Tracking

PASS

Smart Gym + IoT

PASS

MQTT + Node-RED

PASS

AI Habit Tracker

PASS

Behavioral AI

PASS

Virtual Gym Buddy

PASS

Sentiment / Emotional State

PASS

Performance Analyzer

PASS

Performance Score

PASS

Analytics / Progress Reports

PASS

Gym Recommender

PASS

Historical Workout Data

PASS

Workout Planner

PASS

Fitness Challenges

PASS

Notifications

PASS

Profile

PASS

Settings

PASS

Admin Dashboard

PASS

PostgreSQL

PASS

Storage Integration

PASS

Automated Tests

PASS

Frontend Production Build

PASS

Public Deployment

PENDING

Final GitHub Upload

PENDING

Final Submission Package

PENDING

Security

Do not commit .env, .env.local, API keys, database passwords, JWT secrets, cloud credentials or personal credentials to GitHub. Verify .gitignore before the final upload.

Mentor Demo

The mentor does not need the developer's personal password. The application supports registration through /register, so a mentor can create their own account after deployment.

Final Status

Core functionality has been implemented and verified. Remaining finalization:

Public deployment and smoke test

Final GitHub repository upload

Secret/security verification

Final submission package

Project Name: AI Gym & Fitness Assistant

Status: Core functionality completed and verified.