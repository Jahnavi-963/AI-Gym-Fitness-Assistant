# AI Gym & Fitness Assistant

An AI-powered personal fitness management system that combines intelligent workout assistance, nutrition guidance, habit tracking, motivation, performance analysis, gym recommendations, workout planning, challenges, analytics, notifications, IoT integration, and an administrative dashboard into a unified fitness ecosystem.

## Overview

The **AI Gym & Fitness Assistant** is designed to provide personalized fitness support using Artificial Intelligence, Machine Learning, Computer Vision, NLP, and IoT technologies.

The system helps users:

- Track workouts and fitness progress
- Perform exercises with AI-based pose detection
- Receive real-time workout guidance
- Generate personalized diet recommendations
- Track fitness habits and workout consistency
- Interact with an AI fitness companion
- Analyze exercise performance
- Discover nearby gyms
- Create and manage workout plans
- Participate in fitness challenges
- Receive notifications and motivational guidance
- Integrate smart gym equipment using MQTT
- Monitor fitness information through analytics
- Manage the platform through an admin dashboard

---

# Core AI Modules

## 1. AI Gym Trainer

Provides AI-assisted exercise training using computer vision and pose estimation.

**Features:**

- Real-time webcam-based pose detection
- Exercise recognition
- Repetition counting
- Exercise stage detection
- Form monitoring
- Joint-angle analysis
- Exercise-specific feedback
- Workout session tracking

**Supported exercises include:**

- Squats
- Push-ups
- Bicep curls
- Lunges
- Shoulder presses

**Technology:** MediaPipe Pose / Computer Vision

---

## 2. AI Dietician & Calorie Coach

Provides personalized nutrition guidance based on user fitness information and preferences.

**Features:**

- BMI-based recommendations
- Fitness-goal detection
- Weight-loss recommendations
- Vegetarian preference detection
- Nutrition guidance
- Diet recommendations
- AI diet chat
- Suggested food choices

**Technology:** NLP + AI-powered recommendation logic

---

## 3. Smart Gym Assistant

Connects the fitness application with smart gym equipment using MQTT and Node-RED.

**Features:**

- MQTT communication
- Smart equipment commands
- Equipment control
- Real-time message handling
- Node-RED integration
- Smart gym monitoring

Example commands include:

- Set treadmill speed
- Control equipment settings
- Send smart gym instructions

**Technology:** MQTT + Paho MQTT + Node-RED + HiveMQ

---

## 4. AI Fitness Habit Tracker

Uses behavioral machine learning to analyze workout consistency.

**Features:**

- Workout history analysis
- Workout frequency tracking
- Streak monitoring
- Missed-workout tracking
- Engagement analysis
- Workout skip-risk prediction
- Personalized motivational insights

**Machine Learning Model:** Logistic Regression

**Technology:** Scikit-learn

---

## 5. Virtual Gym Buddy

Provides conversational AI support for fitness motivation and guidance.

**Features:**

- AI fitness conversation
- Sentiment analysis
- Emotional-state detection
- Personalized responses
- Fitness motivation
- Workout guidance
- Fallback responses

**Technology:** Groq LLM + NLP

---

## 6. Pose-to-Performance Analyzer

Analyzes workout performance and fitness progress.

**Features:**

- Exercise performance analysis
- Performance score
- Workout statistics
- Progress tracking
- Historical workout analysis
- Analytics dashboard

The system uses workout history and exercise data to provide meaningful fitness insights.

---

## 7. Gym Recommender & Planner

Helps users discover nearby gyms and fitness opportunities.

**Features:**

- Location-based gym search
- Nearby gym discovery
- Fitness-goal-based recommendations
- Activity-level consideration
- Workout-history-based scoring
- AI match score
- Weekly fitness planning
- Gym recommendation ranking

**Data Sources:**

- OpenStreetMap
- Nominatim
- Overpass API

---

# Additional Features

- User registration and login
- JWT authentication
- Password hashing
- User profile management
- Fitness calculation
- BMI calculation
- BMR calculation
- Daily calorie estimation
- Workout history
- Workout planner
- Fitness challenges
- Challenge progress tracking
- Notifications
- Analytics dashboard
- Performance dashboard
- Admin dashboard
- Storage integration
- Local storage fallback
- PostgreSQL database
- SQLite-based planner storage
- MQTT smart gym integration
- API documentation using Swagger/OpenAPI

---

# Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | PostgreSQL, SQLite |
| Authentication | JWT, Passlib, bcrypt |
| Computer Vision | MediaPipe |
| Machine Learning | Scikit-learn, Logistic Regression |
| NLP / AI | Groq LLM |
| IoT | MQTT, Paho MQTT, Node-RED, HiveMQ |
| Gym Data | OpenStreetMap, Nominatim, Overpass API |
| Storage | Local Storage, AWS S3 integration |
| API Documentation | Swagger / OpenAPI |
| Testing | Pytest, HTTPX |

---

# System Architecture

```text
                    ┌──────────────────────────┐
                    │      Next.js Frontend    │
                    │   React + TypeScript     │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌──────────────────────────┐
                    │      FastAPI Backend     │
                    │   Authentication & APIs  │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐     ┌────────────┐     ┌────────────┐
       │ PostgreSQL │     │   SQLite   │     │ AI / ML    │
       │  Database  │     │  Planner   │     │ Services   │
       └────────────┘     └────────────┘     └─────┬──────┘
                                                   │
                          ┌────────────────────────┼─────────────────────┐
                          │                        │                     │
                          ▼                        ▼                     ▼
                    ┌────────────┐          ┌────────────┐       ┌────────────┐
                    │ MediaPipe  │          │ Groq LLM   │       │ Scikit     │
                    │ Pose AI    │          │ AI Buddy   │       │ Learn      │
                    └────────────┘          └────────────┘       └────────────┘

                    Smart Gym / IoT Layer
                              │
                              ▼
                       ┌────────────┐
                       │   MQTT     │
                       │  HiveMQ    │
                       └─────┬──────┘
                             │
                             ▼
                       ┌────────────┐
                       │ Node-RED   │

```
# Project Structure

```text
AI-Gym-Fitness-Assistant/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── storage/
│   ├── venv/
│   ├── .env
│   ├── requirements.txt
│   └── gym_fitness.db
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
│   ├── public/
│   │   └── models/
│   │
│   ├── .env.local
│   ├── package.json
│   └── next.config.ts
│
├── README.md
└── .gitignore
```
---

# Local Development Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Jahnavi-963/AI-Gym-Fitness-Assistant.git
cd AI-Gym-Fitness-Assistant
```

## 2. Backend Setup

Open PowerShell:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

Start the FastAPI server:

```powershell
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API Documentation:

```text
http://127.0.0.1:8000/docs
```

Health Check:

```text
http://127.0.0.1:8000/health
```

## 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

The frontend uses the following environment variable:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

# Important API Endpoints

| Feature | Endpoint |
|---|---|
| Register | `POST /auth/register` |
| Login | `POST /auth/login` |
| Current User | `GET /auth/me` |
| Fitness Calculation | `POST /fitness/calculate` |
| Diet Plan | `POST /diet/plan` |
| Diet Chat | `POST /diet/chat` |
| Habit Summary | `GET /habits/summary` |
| AI Buddy | `POST /buddy/chat` |
| Challenges | `GET /challenges/` |
| Challenge Creation | `POST /challenges/` |
| Challenge Join | `POST /challenges/join` |
| Challenge Progress | `PUT /challenges/{challenge_id}/progress` |
| Gym Recommendation | `POST /gyms/recommend` |
| Planner Plans | `GET /planner/plans` |
| Create Planner | `POST /planner/plans` |
| MQTT Status | `GET /iot/mqtt/status` |
| MQTT Publish | `POST /iot/mqtt/publish` |
| Storage Status | `GET /storage/status` |
| Health Check | `GET /health` |

---

# Frontend Routes

| Route | Description |
|---|---|
| `/` | Dashboard |
| `/login` | Login |
| `/register` | Registration |
| `/trainer` | AI Gym Trainer |
| `/diet` | AI Dietician |
| `/buddy` | Virtual Gym Buddy |
| `/habits` | Habit Tracker |
| `/performance` | Performance Analyzer |
| `/analytics` | Analytics Dashboard |
| `/challenges` | Fitness Challenges |
| `/planner` | Workout Planner |
| `/gyms` | Gym Recommender |
| `/smart-gym` | Smart Gym |
| `/notifications` | Notifications |
| `/profile` | User Profile |
| `/settings` | Settings |
| `/admin` | Admin Dashboard |

---

# Database

The project uses PostgreSQL as the primary application database.

Main database:

```text
ai_gym_fitness
```

The database stores information related to:

- Users
- Authentication
- Workout sessions
- Nutrition logs
- Challenges
- Fitness data
- User activity
- Application records

The workout planner also maintains its local SQLite database for planner-specific data.

---

# Storage

The project includes an extensible storage service supporting:

- Local storage
- AWS S3 integration
- Local fallback

The current development configuration uses local storage fallback.

AWS S3 integration is implemented so that cloud storage can be configured for deployment.

---

# IoT Integration

The Smart Gym module uses MQTT communication.

```text
FastAPI
   │
   ▼
Paho MQTT
   │
   ▼
HiveMQ Public Broker
   │
   ▼
Node-RED
   │
   ▼
Smart Gym Equipment / Dashboard
```

Example MQTT topic:

```text
ai-gym-fitness/smart-gym
```

Example command:

```json
{
  "equipment": "treadmill_01",
  "action": "set_speed",
  "value": 6
}
```
---

# AI / Machine Learning

The project integrates multiple Artificial Intelligence and Machine Learning approaches.

## Computer Vision

MediaPipe Pose is used for:

- Real-time pose detection
- Exercise recognition
- Joint-angle analysis
- Repetition counting
- Exercise stage detection
- Form monitoring
- Workout feedback

## Machine Learning

Scikit-learn Logistic Regression is used for:

- Workout skip-risk prediction
- Behavioral fitness analysis
- Workout consistency analysis

## NLP / Large Language Model

Groq LLM is used for:

- Virtual fitness assistance
- Conversational guidance
- Fitness motivation
- Personalized responses
- AI fitness conversations

## Recommendation System

The gym recommendation system considers:

- User fitness goals
- Activity level
- Workout history
- User location
- Nearby gym information

---

# Testing

The backend automated test suite was executed using Pytest.

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q
```

Verified result:

```text
14 passed
```

The application was also manually verified through:

- FastAPI Swagger
- Frontend pages
- User authentication
- AI Gym Trainer
- AI Dietician
- AI Fitness Habit Tracker
- Virtual Gym Buddy
- Fitness Challenges
- Gym Recommendations
- Workout Planner
- Smart Gym MQTT
- Node-RED integration
- Storage integration
- Analytics Dashboard
- Performance Dashboard
- Admin Dashboard
- Notifications
- User Profile
- Settings

---

# Verification Status

| Module / Requirement | Status |
|---|---|
| User Authentication | ✅ Verified |
| Fitness Calculation | ✅ Verified |
| AI Gym Trainer | ✅ Verified |
| AI Dietician | ✅ Verified |
| AI Fitness Habit Tracker | ✅ Verified |
| Virtual Gym Buddy | ✅ Verified |
| Pose-to-Performance Analyzer | ✅ Verified |
| Gym Recommender | ✅ Verified |
| Workout Planner | ✅ Verified |
| Fitness Challenges | ✅ Verified |
| Smart Gym MQTT | ✅ Verified |
| Node-RED Integration | ✅ Verified |
| Storage Integration | ✅ Verified |
| Notifications | ✅ Verified |
| Analytics Dashboard | ✅ Verified |
| Performance Dashboard | ✅ Verified |
| Admin Dashboard | ✅ Verified |
| PostgreSQL Database | ✅ Verified |
| Frontend Production Build | ✅ Passed |
| Backend Automated Tests | ✅ 14 Passed |

---

# Security

The project implements application security mechanisms including:

- JWT-based authentication
- Password hashing
- Protected API endpoints
- Environment variables for secrets
- `.env` files excluded from Git
- `.env.local` excluded from Git
- `node_modules` excluded from Git
- Backend virtual environment excluded from Git

API keys and private credentials should be configured through environment variables and should not be committed to the repository.
---

# Mentor Demo

The recommended demonstration flow for the project is:

1. Register or log in to the application.
2. Complete the fitness profile.
3. Calculate BMI and daily calorie requirements.
4. Open the AI Gym Trainer.
5. Demonstrate an exercise using webcam-based pose detection.
6. Show repetition counting and form feedback.
7. Open the AI Dietician and request a personalized diet recommendation.
8. Open the AI Fitness Habit Tracker and demonstrate behavioral prediction.
9. Chat with the Virtual Gym Buddy.
10. Open Performance and Analytics dashboards.
11. Demonstrate fitness challenges and progress tracking.
12. Open the Gym Recommender and show nearby gym recommendations.
13. Open the Workout Planner.
14. Demonstrate Smart Gym MQTT communication through Node-RED.
15. Show the Admin Dashboard.

---

# Future Enhancements

Possible future improvements include:

- Mobile application
- Wearable device integration
- Real-time heart-rate monitoring
- Advanced nutrition database
- Additional exercise recognition models
- Cloud deployment
- Advanced AI-generated workout plans
- Voice-based fitness assistant
- Real gym equipment integration
- Personalized long-term fitness prediction
- Advanced progress forecasting
- Cloud-based analytics
- More advanced recommendation algorithms

---

# Author

**Jahnavi**

B.Tech – Computer Science and Engineering (AI & ML)

---

# Project Status

**AI Gym & Fitness Assistant — Internship / Final Project**

The major application modules, AI features, backend APIs, frontend interface, database integration, IoT communication, storage integration, testing, and documentation have been implemented and verified in the local development environment.

The project is structured as a modular AI-powered fitness ecosystem that can be extended with additional AI models, cloud services, wearable integrations, and real-world smart gym equipment in future versions.

