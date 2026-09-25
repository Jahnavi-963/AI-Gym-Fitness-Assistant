# AI Gym & Fitness Assistant

An AI-powered personal fitness management system that combines intelligent workout assistance, nutrition guidance, habit tracking, motivation, performance analysis, gym recommendations, workout planning, challenges, analytics, notifications, IoT integration, and an administrative dashboard into a unified fitness ecosystem.

---

## Overview

The **AI Gym & Fitness Assistant** is designed to act as a personalized digital fitness companion.

The system combines:

- AI-based exercise analysis
- Personalized fitness and nutrition recommendations
- Behavioral analysis
- Conversational AI
- Performance tracking
- Gym recommendations
- Workout planning
- Fitness challenges
- IoT integration
- Analytics and progress tracking
- User and admin management

The application provides both **AI-powered guidance** and **fitness data management** through a modern web interface.

---

# Core AI Modules

## 1. AI Gym Trainer

The AI Gym Trainer uses computer vision and pose analysis to assist users during workouts.

### Features

- Real-time pose detection
- Exercise recognition
- Repetition counting
- Body-angle analysis
- Exercise-stage detection
- Form analysis
- Form correction feedback
- Workout duration tracking
- Calorie estimation
- Workout session storage

### Supported Exercises

- Squats
- Push-ups
- Bicep curls
- Lunges
- Shoulder press

### Technology

- MediaPipe Tasks Vision
- Computer Vision
- Pose Landmarker

---

## 2. AI Dietician & Calorie Coach

The AI Dietician provides personalized nutrition and calorie guidance based on user information and fitness goals.

### Features

- BMI calculation
- BMR calculation
- Daily calorie estimation
- Fitness-goal detection
- Food-preference detection
- Goal-based meal recommendations
- Meal planning
- Grocery suggestions
- Nutrition tracking
- NLP-based diet chatbot

Supported preferences and goals can include vegetarian/non-vegetarian choices and objectives such as weight loss or fitness improvement.

---

## 3. Smart Gym Assistant

The Smart Gym Assistant connects the fitness application with IoT-enabled gym equipment.

### Features

- MQTT communication
- Smart equipment commands
- Equipment monitoring
- IoT integration
- Node-RED workflow integration
- Real-time MQTT message handling

### IoT Stack

- MQTT
- HiveMQ
- Node-RED

---

## 4. AI Fitness Habit Tracker

The Habit Tracker uses behavioral data and machine learning to understand workout patterns.

### Features

- Workout frequency tracking
- Workout streaks
- Missed-workout tracking
- Engagement analysis
- Skip-risk prediction
- Motivation support
- Dynamic scheduling
- Behavioral insights

### Machine Learning

A Logistic Regression model is used to estimate workout skip risk using behavioral and workout-history features.

---

## 5. Virtual Gym Buddy

The Virtual Gym Buddy provides conversational fitness assistance.

### Features

- Conversational AI
- Workout guidance
- Nutrition support
- Fitness motivation
- Sentiment analysis
- Emotional-state guidance
- Personalized responses

The assistant can provide contextual recommendations based on the user's fitness activity and conversation.

---

## 6. Pose-to-Performance Analyzer

The Performance Analyzer converts workout data into measurable performance insights.

### Features

- Performance Score
- Form Score
- Motion-efficiency analysis
- Repetition tracking
- Calories burned
- Exercise breakdown
- Workout history
- Progress analysis
- Performance reports

---

## 7. Gym Recommender & Planner

The Gym Recommender helps users discover nearby gyms and fitness opportunities.

### Features

- Nearby gym search
- Location-based recommendations
- Fitness-goal-based recommendations
- Activity-level analysis
- Historical workout-data analysis
- Personalized gym matching
- Weekly workout planning

The recommendation system combines user fitness information with workout history and location-based gym data.

---

# Additional Features

- JWT authentication
- User registration and login
- Personal profile
- User settings
- Workout history
- Personalized workout planner
- Fitness challenges
- Challenge progress tracking
- Notifications
- Analytics dashboard
- Performance tracking
- Admin dashboard
- Storage integration
- PostgreSQL database
- SQLite planner database
- MQTT and Node-RED integration

---

# Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Frontend Architecture | Next.js App Router |
| Backend | Python, FastAPI, Uvicorn |
| Database ORM | SQLAlchemy |
| Authentication | JWT |
| AI / Computer Vision | MediaPipe |
| Machine Learning | scikit-learn, Logistic Regression |
| NLP / LLM | NLP processing, Groq LLM integration |
| Database | PostgreSQL, SQLite |
| IoT | MQTT, HiveMQ, Node-RED |
| Testing | pytest, httpx |
| Storage | Local storage with AWS S3 integration |
| API Documentation | FastAPI Swagger / OpenAPI |

---

# System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Admin    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │ React + TypeScript    │
                    └──────────┬───────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend    │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
 ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
 │   PostgreSQL   │   │ SQLite Planner │   │   AI Services  │
 │ Main Database  │   │    Database    │   │ ML / NLP / CV  │
 └────────────────┘   └────────────────┘   └────────────────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │ MQTT / HiveMQ    │
                                        └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │    Node-RED      │
                                        │  Smart Gym IoT   │
                                        └──────────────────┘
# Project Structure
AI-Gym-Fitness-Assistant/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── pose_analyzer.py
│   │   │
│   │   ├── api/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── buddy.py
│   │   │   ├── challenges.py
│   │   │   ├── diet.py
│   │   │   ├── fitness.py
│   │   │   ├── gyms.py
│   │   │   ├── habits.py
│   │   │   ├── iot.py
│   │   │   ├── notifications.py
│   │   │   ├── nutrition.py
│   │   │   ├── planner.py
│   │   │   ├── storage.py
│   │   │   ├── trainer.py
│   │   │   └── workouts.py
│   │   │
│   │   ├── services/
│   │   │   ├── behavior_model.py
│   │   │   ├── mqtt_service.py
│   │   │   └── storage.py
│   │   │
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   │
│   ├── tests/
│   │   └── test_api.py
│   │
│   ├── migrate_sqlite_to_postgres.py
│   └── requirements.txt
│
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
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   └── public/
│       └── models/
│           └── pose_landmarker_lite.task
│
└── README.md
Local Development Setup
Prerequisites

Install:

Python 3.10+
Node.js
npm
PostgreSQL
Node-RED
Git
Run Backend

Open PowerShell:

cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload

 # Backend:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health
Run Frontend

Open another terminal:

cd frontend
npm install
npm run dev

 # Frontend:

http://localhost:3000
Run Node-RED
node-red

 # Node-RED:

http://127.0.0.1:1880/

MQTT broker:

broker.hivemq.com:1883

MQTT topic:

ai-gym-fitness/smart-gym
Important API Endpoints
Authentication
POST /auth/register
POST /auth/login
GET  /auth/me
Fitness
POST /fitness/calculate
Diet & Nutrition
POST /diet/plan
POST /diet/chat
Habit Tracking
GET /habits/summary
Gym Recommendations
GET /gyms/recommend
Workout Planner
GET  /planner/plans
POST /planner/plans
POST /planner/plans/{plan_id}/exercises
PUT  /planner/exercises/{exercise_id}/complete
Challenges
GET  /challenges/
POST /challenges/
POST /challenges/join
PUT  /challenges/{challenge_id}/progress
IoT
GET  /iot/mqtt/status
POST /iot/mqtt/publish
Storage
GET /storage/status
Frontend Routes
/
 /admin
 /analytics
 /buddy
 /challenges
 /diet
 /gyms
 /habits
 /login
 /notifications
 /performance
 /planner
 /profile
 /register
 /settings
 /smart-gym
 /trainer
Database
PostgreSQL

PostgreSQL is the primary application database used for:

User accounts
Authentication
Fitness information
Workout sessions
Nutrition records
Challenges
Notifications
Analytics
Other application data
SQLite

SQLite is currently used by the workout planner:

backend/gym_fitness.db

A development backup is maintained separately for recovery purposes.

Storage

The application includes a storage abstraction supporting:

Local storage
AWS S3 integration

The current development configuration uses local storage fallback.

AWS S3 integration is prepared for production configuration but requires valid production cloud credentials and bucket configuration.

Never commit AWS credentials, API keys, database passwords, or JWT secrets to GitHub.

 # IoT Integration

The Smart Gym module communicates through MQTT.

Example message:

{
  "equipment": "treadmill_01",
  "action": "set_speed",
  "value": 6
}

Message flow:

AI Gym Application
        ↓
FastAPI Backend
        ↓
MQTT / HiveMQ
        ↓
Node-RED
        ↓
Smart Gym Equipment / Workflow
AI / Machine Learning
Computer Vision

MediaPipe Tasks Vision

Used for:

Pose detection
Exercise analysis
Body-angle calculation
Repetition counting
Form analysis
Behavioral Machine Learning

 # Logistic Regression

Used for:

Workout engagement analysis
Skip-risk prediction
Behavioral insights
NLP

Used for:

Fitness-goal detection
Food-preference detection
Diet conversation
Personalized recommendations
Conversational AI

LLM integration is used by the Virtual Gym Buddy for:

Fitness assistance
Motivation
Workout guidance
Nutrition support
Personalized responses
Testing
Backend Automated Tests

The backend test suite was executed using:

python -m pytest -q

Result:

14 passed

The test run completed successfully.

Frontend Production Build

The production build was verified using:

npm run build

 # Result:

Build completed successfully
Verification Status
Module / Requirement	Status
AI Gym Trainer	PASS
AI Dietician	PASS
NLP Diet Chatbot	PASS
Nutrition Tracking	PASS
Smart Gym + IoT	PASS
MQTT + Node-RED	PASS
AI Habit Tracker	PASS
Behavioral AI	PASS
Virtual Gym Buddy	PASS
Sentiment / Emotional State	PASS
Performance Analyzer	PASS
Performance Score	PASS
Analytics / Progress Reports	PASS
Gym Recommender	PASS
Historical Workout Data	PASS
Workout Planner	PASS
Fitness Challenges	PASS
Notifications	PASS
Profile	PASS
Settings	PASS
Admin Dashboard	PASS
PostgreSQL	PASS
Storage Integration	PASS
Automated Tests	PASS
Frontend Production Build	PASS
Security

The following files and credentials must never be committed to GitHub:

.env
.env.local
API keys
Database passwords
JWT secrets
AWS credentials
Personal credentials

The repository .gitignore is configured to exclude sensitive environment files and development-generated files.

For deployment, environment variables should be configured through the hosting platform rather than hard-coded into source code.

 # Mentor Demo

The mentor does not need the developer's personal password.

The application provides user registration through:

/register

A mentor can create a separate account after the application is deployed.

For local demonstration, the backend, frontend, database and Node-RED services can be started independently.

Future Enhancements

Potential production enhancements include:

Public cloud deployment
Production AWS S3 storage
Real gym IoT hardware integration
Advanced pose models
More exercise types
Mobile application
Advanced personalized nutrition
Wearable-device integration
Real-time equipment control
Advanced recommendation models
Cloud monitoring and analytics
Author

Jahnavi

B.Tech – Computer Science & Engineering (AI & ML)

 # Project Status

AI Gym & Fitness Assistant

Core functionality: Completed and verified

The project includes the major AI fitness modules, backend APIs, frontend interface, database integration, machine-learning components, conversational AI, workout planning, challenges, analytics, storage integration, and MQTT/Node-RED IoT integration.

The source code is maintained in the GitHub repository:

AI-Gym-Fitness-Assistant


