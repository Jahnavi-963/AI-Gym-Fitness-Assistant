from __future__ import annotations

from typing import List, Dict

import numpy as np
from sklearn.linear_model import LogisticRegression


class WorkoutSkipPredictor:
    """
    Simple behavioral ML model that predicts the probability
    that a user may skip their next workout.

    Features:
    1. workouts in the last 7 days
    2. average workout duration
    3. current workout streak
    4. missed-workout count
    5. recent engagement score
    """

    def __init__(self) -> None:
        self.model = LogisticRegression(
            random_state=42,
            max_iter=1000
        )

        self._train_model()

    def _train_model(self) -> None:
        # Small baseline training dataset.
        #
        # Columns:
        # [weekly_workouts,
        #  avg_duration,
        #  streak,
        #  missed_workouts,
        #  engagement_score]
        X = np.array([
            [6, 45, 8, 0, 90],
            [5, 40, 6, 1, 82],
            [5, 35, 5, 1, 78],
            [4, 40, 4, 1, 75],
            [4, 35, 3, 2, 70],
            [3, 30, 2, 2, 65],
            [3, 25, 1, 3, 58],
            [2, 25, 1, 4, 50],
            [2, 20, 0, 5, 42],
            [1, 20, 0, 6, 35],
            [1, 15, 0, 7, 28],
            [0, 0, 0, 7, 20],
        ])

        # 0 = likely to continue
        # 1 = higher skip risk
        y = np.array([
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
        ])

        self.model.fit(X, y)

    def predict(
        self,
        weekly_workouts: int,
        avg_duration: float,
        streak: int,
        missed_workouts: int,
        engagement_score: float,
    ) -> Dict:
        features = np.array([[
            weekly_workouts,
            avg_duration,
            streak,
            missed_workouts,
            engagement_score,
        ]])

        probability = float(
            self.model.predict_proba(features)[0][1]
        )

        risk_percentage = round(probability * 100, 2)

        if risk_percentage >= 70:
            risk_level = "High"
            recommendation = (
                "Your recent activity shows a higher chance of "
                "skipping the next workout. Try a shorter workout "
                "and keep your schedule simple."
            )
        elif risk_percentage >= 40:
            risk_level = "Medium"
            recommendation = (
                "Your workout consistency is moderate. "
                "A small achievable workout can help maintain momentum."
            )
        else:
            risk_level = "Low"
            recommendation = (
                "Your recent workout behavior looks consistent. "
                "Keep following your current routine."
            )

        return {
            "skip_probability": risk_percentage,
            "risk_level": risk_level,
            "recommendation": recommendation,
        }


workout_skip_predictor = WorkoutSkipPredictor()