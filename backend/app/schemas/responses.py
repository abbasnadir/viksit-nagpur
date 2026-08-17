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
