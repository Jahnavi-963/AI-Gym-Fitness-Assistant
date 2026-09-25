from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/trainer",
    tags=["AI Gym Trainer"]
)


class PoseRequest(BaseModel):
    exercise: str
    angle: float
    stage: str


class PoseResponse(BaseModel):
    exercise: str
    angle: float
    stage: str
    form_score: int
    feedback: str


def calculate_form_score(exercise: str, angle: float) -> int:
    exercise = exercise.lower()

    if exercise == "squat":
        if 80 <= angle <= 110:
            return 95
        elif 70 <= angle < 80 or 110 < angle <= 125:
            return 85
        elif 60 <= angle < 70 or 125 < angle <= 140:
            return 70
        return 55

    if exercise == "pushup":
        if 70 <= angle <= 100:
            return 95
        elif 60 <= angle < 70 or 100 < angle <= 120:
            return 85
        return 65

    if exercise == "bicep_curl":
        if angle <= 50:
            return 95
        elif angle <= 80:
            return 85
        return 70

    if exercise == "lunge":
        if 80 <= angle <= 110:
            return 95
        elif 70 <= angle < 80 or 110 < angle <= 125:
            return 85
        return 65

    if exercise == "shoulder_press":
        if angle <= 80:
            return 95
        elif angle <= 110:
            return 85
        return 70

    return 70


def get_feedback(exercise: str, stage: str, angle: float) -> str:
    exercise = exercise.lower()

    if exercise == "squat":
        if stage == "down":
            return "Good squat depth. Keep your back straight."
        return "Good. Now slowly go down."

    if exercise == "pushup":
        if stage == "down":
            return "Good depth. Keep your body straight."
        return "Push up steadily and keep your core tight."

    if exercise == "bicep_curl":
        if stage == "up":
            return "Great curl. Squeeze your biceps."
        return "Slowly lower the weight with control."

    if exercise == "lunge":
        if stage == "down":
            return "Good lunge depth. Keep your knee aligned."
        return "Stand tall and prepare for the next lunge."

    if exercise == "shoulder_press":
        if stage == "up":
            return "Good press. Keep your arms controlled."
        return "Lower your arms slowly and maintain good posture."

    return "Keep your movement controlled."


@router.post("/analyze", response_model=PoseResponse)
def analyze_pose(data: PoseRequest):

    score = calculate_form_score(
        data.exercise,
        data.angle
    )

    feedback = get_feedback(
        data.exercise,
        data.stage,
        data.angle
    )

    return {
        "exercise": data.exercise,
        "angle": round(data.angle, 2),
        "stage": data.stage,
        "form_score": score,
        "feedback": feedback
    }