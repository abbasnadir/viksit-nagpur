from pydantic import BaseModel
from typing import Optional

class OfficerStatus(BaseModel):
    officer_id: str
    availability: str
    current_assignment: Optional[str]
    workload: int

class RouteInfoResponse(BaseModel):
    distance_meters: int
    duration_seconds: int
    traffic_duration_seconds: Optional[int]
    polyline: str

class TomTomFlowResponse(BaseModel):
    current_speed: float
    free_flow_speed: float
    current_travel_time: int
    free_flow_travel_time: int
    confidence: float
    road_closure: bool
    congestion_ratio: float
    congestion_level: str
