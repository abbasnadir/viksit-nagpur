"""Traffic telemetry, status, and overview endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    JunctionLiveStatus,
    TrafficRecordPayload,
    CityOverviewKPIs
)
from app.services.traffic_service import traffic_service

router = APIRouter(prefix="/traffic", tags=["Traffic Telemetry"])


@router.get("/overview", response_model=CityOverviewKPIs)
async def get_city_traffic_overview():
    """Retrieve high-level KPIs: average city speed, bottleneck counts, congestion index."""
    return traffic_service.get_city_kpis()


@router.get("/junctions", response_model=List[JunctionLiveStatus])
async def list_all_junctions():
    """List all monitored Nagpur junctions with live speed, queue length, and volume."""
    return traffic_service.get_all_junctions()


@router.get("/junctions/{junction_id}", response_model=JunctionLiveStatus)
async def get_junction_status(junction_id: str):
    """Retrieve single junction real-time telemetry."""
    junc = traffic_service.get_junction(junction_id)
    if not junc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Junction '{junction_id}' not found in Nagpur traffic network."
        )
    return junc


@router.post("/record", response_model=JunctionLiveStatus)
async def record_traffic_telemetry(payload: TrafficRecordPayload):
    """Record live sensor/camera tick for a junction."""
    try:
        updated = await traffic_service.record_telemetry(payload)
        return updated
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
