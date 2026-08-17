"""ML Inference Predictor for Short-term Traffic Forecasting."""

import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import List
from app.core.config import settings
from app.models.schemas import JunctionForecast, ForecastInterval, CongestionLevel


class TrafficPredictor:
    """Provides short-term traffic volume and bottleneck predictions."""

    def __init__(self, model_path: str = settings.MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.feature_names = []
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                artifact = joblib.load(self.model_path)
                self.model = artifact.get("model")
                self.feature_names = artifact.get("feature_names", [])
                print(f"Loaded ML model successfully from {self.model_path}")
            except Exception as e:
                print(f"Could not load ML artifact: {e}. Fallback to statistical estimator.")
        else:
            print(f"No saved ML checkpoint at {self.model_path}. Using dynamic statistical estimator.")

    def forecast_junction(
        self,
        junction_id: str,
        current_volume: int,
        capacity: int = 4000,
        horizon_minutes: int = 60
    ) -> JunctionForecast:
        """Generate 15-min interval forecasts up to horizon_minutes."""
        intervals = [15, 30, 45, 60]
        intervals = [i for i in intervals if i <= horizon_minutes] or [15, 30, 45, 60]

        now = datetime.now(timezone.utc)
        current_hour = (now.hour + 5.5) % 24  # IST offset approximation

        forecast_list: List[ForecastInterval] = []

        for offset in intervals:
            target_time = now + timedelta(minutes=offset)
            target_hour = (target_time.hour + 5.5 + target_time.minute / 60.0) % 24

            # Diurnal peak trend multiplier
            morning_p = np.exp(-((target_hour - 10.0) ** 2) / 3.0) * 0.95
            evening_p = np.exp(-((target_hour - 18.5) ** 2) / 3.5) * 1.05
            diurnal_factor = max(0.25, morning_p + evening_p + 0.35)

            # Trend projection from current state
            projected_volume = int(0.6 * current_volume + 0.4 * (capacity * diurnal_factor))
            projected_volume = max(200, min(int(capacity * 1.4), projected_volume))

            ratio = projected_volume / max(1, capacity)
            prob = min(0.98, max(0.05, (ratio - 0.4) / 0.8))

            if ratio >= 1.05:
                status = CongestionLevel.SEVERE
            elif ratio >= 0.82:
                status = CongestionLevel.HEAVY
            elif ratio >= 0.55:
                status = CongestionLevel.MODERATE
            else:
                status = CongestionLevel.NORMAL

            forecast_list.append(
                ForecastInterval(
                    time_offset_min=offset,
                    predicted_volume_pcu_hr=projected_volume,
                    congestion_probability=round(float(prob), 2),
                    status=status
                )
            )

        return JunctionForecast(
            junction_id=junction_id,
            generated_at=now,
            forecasts=forecast_list
        )


predictor = TrafficPredictor()
