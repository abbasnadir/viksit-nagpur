from pydantic import BaseModel, Field

class RouteComputeRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
