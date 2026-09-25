from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200


def test_health():
    response = client.get("/health")

    assert response.status_code == 200


def test_notifications_requires_authentication():
    response = client.get("/notifications/")

    assert response.status_code == 401


def test_fitness_calculation_requires_authentication():
    response = client.post(
        "/fitness/calculate",
        json={
            "height": 165,
            "weight": 62,
            "age": 21,
            "gender": "female",
            "activity_level": "moderate",
            "fitness_goal": "weight_loss",
        },
    )

    assert response.status_code == 401


def test_workout_history_requires_authentication():
    response = client.get("/workouts/history")

    assert response.status_code == 401


def test_workout_summary_requires_authentication():
    response = client.get("/workouts/summary")

    assert response.status_code == 401


def test_diet_plan_requires_authentication():
    response = client.post(
        "/diet/plan",
        json={
            "diet_preference": "vegetarian",
            "fitness_goal": "weight_loss",
            "daily_calories": 1600,
        },
    )

    assert response.status_code == 401


def test_buddy_requires_authentication():
    response = client.post(
        "/buddy/chat",
        json={
            "message": "Help me stay motivated for my workout."
        },
    )

    assert response.status_code == 401


def test_habit_summary_requires_authentication():
    response = client.get("/habits/summary")

    assert response.status_code == 401

def test_gym_search_endpoint():
    response = client.get("/gyms/search?location=Vadodara")

    assert response.status_code == 200


def test_admin_dashboard_requires_authentication():
    response = client.get("/admin/dashboard")

    assert response.status_code == 401


def test_notifications_endpoint_exists():
    response = client.get("/notifications/")

    assert response.status_code in [401, 403]


def test_workout_history_endpoint_exists():
    response = client.get("/workouts/history")

    assert response.status_code in [401, 403]


def test_buddy_endpoint_exists():
    response = client.post(
        "/buddy/chat",
        json={
            "message": "Hello"
        },
    )

    assert response.status_code in [401, 403]