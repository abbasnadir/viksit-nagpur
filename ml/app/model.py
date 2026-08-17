from pathlib import Path

import joblib
import pandas as pd


MODEL_PATH = Path("models/risk_model.pkl")


if not MODEL_PATH.exists():
    raise FileNotFoundError(
        """
Trained model not found.

Obtain real data and run:

python train.py
"""
    )


saved = joblib.load(MODEL_PATH)

model = saved["model"]
features = saved["features"]


def predict_risk(data: dict):

    row = pd.DataFrame(
        [data],
        columns=features
    )

    probability = model.predict_proba(
        row
    )[0][1]

    risk_score = round(
        probability * 100,
        2
    )

    if risk_score < 25:
        level = "LOW"

    elif risk_score < 50:
        level = "MODERATE"

    elif risk_score < 75:
        level = "HIGH"

    else:
        level = "CRITICAL"

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "incident_probability": round(
            probability,
            4
        )
    }