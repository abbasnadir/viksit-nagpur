from fastapi import FastAPI
from pydantic import BaseModel

from app.model import predict_risk


app = FastAPI(
    title="Nagpur Traffic Risk Prediction"
)


class RiskRequest(BaseModel):

    # REAL CURRENT TRAFFIC DATA
    average_speed: float
    occupancy: float

    # CALCULATED FROM REAL HISTORICAL TRAFFIC
    historical_avg_speed: float
    historical_avg_occupancy: float
    speed_reduction: float

    # CALCULATED FROM REAL HISTORICAL INCIDENTS
    historical_incidents: float

    # REAL IMD WEATHER DATA
    rainfall: float
    temperature: float
    visibility: float

    # DERIVED FROM CURRENT TIMESTAMP
    hour: int
    day_of_week: int
    is_weekend: int


@app.get("/health")
def health():

    return {
        "status": "ok"
    }


@app.post("/predict-risk")
def predict(request: RiskRequest):

    result = predict_risk(
        request.model_dump()
    )

    return result