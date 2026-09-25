import math


def calculate_angle(a, b, c):
    angle = math.degrees(
        math.atan2(c[1] - b[1], c[0] - b[0])
        - math.atan2(a[1] - b[1], a[0] - b[0])
    )

    angle = abs(angle)

    if angle > 180:
        angle = 360 - angle

    return round(angle, 2)


def analyze_squat(left_hip, left_knee, left_ankle):
    knee_angle = calculate_angle(
        left_hip,
        left_knee,
        left_ankle
    )

    if knee_angle > 160:
        stage = "up"
        feedback = "Stand straight and get ready for the next squat."

    elif knee_angle < 100:
        stage = "down"
        feedback = "Good squat depth. Keep your back straight."

    else:
        stage = "transition"
        feedback = "Control your movement."

    return {
        "exercise": "Squat",
        "knee_angle": knee_angle,
        "stage": stage,
        "feedback": feedback
    }


def calculate_form_score(knee_angle):
    if 80 <= knee_angle <= 110:
        return 95

    if 70 <= knee_angle < 80 or 110 < knee_angle <= 125:
        return 85

    if 60 <= knee_angle < 70 or 125 < knee_angle <= 140:
        return 70

    return 55