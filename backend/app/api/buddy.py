import os

import requests
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from .auth import get_current_user

router = APIRouter(prefix="/buddy", tags=["Virtual Gym Buddy"])


class BuddyMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)


def detect_sentiment(message: str):
    text = message.lower()

    motivated_words = [
        "motivated",
        "excited",
        "ready",
        "determined",
        "challenge",
        "strong",
    ]

    frustrated_words = [
        "frustrated",
        "annoyed",
        "angry",
        "fed up",
        "not working",
        "failed",
    ]

    positive_words = [
        "happy",
        "good",
        "great",
        "awesome",
        "positive",
        "amazing",
        "success",
    ]

    negative_words = [
        "sad",
        "tired",
        "bad",
        "stress",
        "stressed",
        "lazy",
        "skip",
        "depressed",
        "upset",
    ]

    if any(word in text for word in frustrated_words):
        return "frustrated"

    if any(word in text for word in motivated_words):
        return "motivated"

    if any(word in text for word in positive_words):
        return "positive"

    if any(word in text for word in negative_words):
        return "negative"

    return "neutral"


def safe_fallback_response(message: str, sentiment: str):
    text = message.lower()

    if "diet" in text or "food" in text:
        return (
            "I can help with your nutrition journey! 🥗 "
            "Use the AI Dietician module for your personalized meal plan."
        )

    if "workout" in text or "exercise" in text or "gym" in text:
        return (
            "Let's get moving! 💪 Start with a warm-up and focus on "
            "controlled movements and correct exercise form."
        )

    if "tired" in text or "stress" in text or "stressed" in text:
        return (
            "It's okay to slow down. ❤️ Take a recovery break, stay "
            "hydrated, and return to exercise when you feel ready."
        )

    if "skip" in text or "lazy" in text:
        return (
            "Start small today. 🔥 Even a short workout can help you "
            "maintain consistency and build your fitness habit."
        )

    if "progress" in text or "improve" in text:
        return (
            "Keep tracking your workouts! 📈 Your workout history and "
            "performance scores can help you understand your progress."
        )

    if sentiment == "motivated":
        return (
            "That's the energy we need! 🔥 Stay focused on your goal "
            "and keep your workout consistent."
        )

    if sentiment == "frustrated":
        return (
            "I understand that progress can sometimes feel frustrating. "
            "Let's focus on one small improvement at a time. 💪"
        )

    if sentiment == "positive":
        return (
            "That's great to hear! 😄 Keep that positive energy going "
            "and stay consistent with your fitness journey."
        )

    if sentiment == "negative":
        return (
            "Everyone has difficult days. ❤️ Take things one step at "
            "a time and focus on what feels manageable today."
        )

    return (
        "You've got this! 💪 Stay consistent, focus on your goals, "
        "and take your fitness journey one step at a time."
    )


def generate_llm_response(
    message: str,
    sentiment: str,
    current_user: User
):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return safe_fallback_response(message, sentiment)

    system_prompt = f"""
You are an AI Virtual Gym Buddy inside an AI Gym & Fitness Assistant.

User name: {current_user.name}
User sentiment: {sentiment}

Your responsibilities:
- Answer general fitness questions.
- Give workout guidance.
- Explain exercises and proper form.
- Motivate the user.
- Encourage workout consistency.
- Discuss fitness goals and progress.
- Give general nutrition guidance.
- Keep responses practical and beginner-friendly.

Safety rules:
- Do NOT diagnose medical conditions.
- Do NOT prescribe medicines.
- Do NOT claim to replace a doctor, physiotherapist, or qualified dietitian.
- For serious pain, injury, breathing problems, chest pain, dizziness,
  or other concerning symptoms, advise the user to seek qualified
  medical care.
- Do not give dangerous exercise instructions.
- Keep responses concise and useful.
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": message,
            },
        ],
        "temperature": 0.5,
        "max_tokens": 400,
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )

        if response.status_code != 200:
            return safe_fallback_response(message, sentiment)

        result = response.json()

        return result["choices"][0]["message"]["content"].strip()

    except Exception:
        return safe_fallback_response(message, sentiment)


@router.post("/chat")
def buddy_chat(
    data: BuddyMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sentiment = detect_sentiment(data.message)

    response = generate_llm_response(
        data.message,
        sentiment,
        current_user
    )

    return {
        "user_id": current_user.id,
        "user_name": current_user.name,
        "message": data.message,
        "sentiment": sentiment,
        "response": response,
        "ai_provider": (
            "Groq LLM"
            if os.getenv("GROQ_API_KEY")
            else "Local fallback"
        ),
    }