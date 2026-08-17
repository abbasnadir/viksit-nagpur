"""Machine learning traffic congestion forecasting endpoints."""

from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import JunctionForecast
from app.services.traffic_service import traffic_service
from app.ml.predictor import predictor

router = APIRouter(prefix="/predictions", tags=["ML Predictions"])


@router.get("/forecast/{junction_id}", response_model=JunctionForecast)
async def get_junction_forecast(
    junction_id: str,
    horizon_minutes: int = Query(60, ge=15, le=180, description="Forecast horizon in minutes")
):
    """Retrieve 15/30/45/60 min forward congestion and volume predictions."""
    junc = traffic_service.get_junction(junction_id)
    if not junc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Junction '{junction_id}' not found."
        )

    forecast = predictor.forecast_junction(
        junction_id=junc.id,
        current_volume=junc.current_volume_pcu_hr,
        capacity=junc.capacity_pcu_hr,
        horizon_minutes=horizon_minutes
    )
    return forecast
