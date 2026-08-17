import httpx
from fastapi import APIRouter, HTTPException, status
from app.api.router import get_base_router
from app.schemas.requests import RouteComputeRequest
from app.schemas.responses import RouteInfoResponse, TomTomFlowResponse
from app.schemas.base import BaseResponse
from app.core.config import settings

router = get_base_router(prefix="/traffic", tags=["Traffic"])

@router.get("/flow", response_model=BaseResponse[TomTomFlowResponse], openapi_extra={"is_public": True})
async def get_traffic_flow(lat: float, lng: float):
    """Fetches real-time textual traffic flow data using TomTom API."""
    if not settings.TOMTOM_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TomTom API key is not configured."
        )

    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/22/json?point={lat},{lng}&key={settings.TOMTOM_API_KEY}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            flow_data = data.get("flowSegmentData", {})
            if not flow_data:
                raise HTTPException(status_code=404, detail="No traffic data found for this location.")
                
            current_speed = flow_data.get("currentSpeed", 0.0)
            free_flow = flow_data.get("freeFlowSpeed", 1.0) # avoid division by zero
            
            # Calculate Congestion Ratio (0.0 to 1.0+)
            ratio = max(0.0, (free_flow - current_speed) / free_flow)
            
            # Determine Level
            level = "FREE_FLOW"
            if flow_data.get("roadClosure"):
                level = "CLOSED"
            elif ratio >= 0.65:
                level = "SEVERE"
            elif ratio >= 0.35:
                level = "HEAVY"
            elif ratio >= 0.15:
                level = "MODERATE"
                
            return BaseResponse(
                success=True,
                data=TomTomFlowResponse(
                    current_speed=current_speed,
                    free_flow_speed=free_flow,
                    current_travel_time=flow_data.get("currentTravelTime", 0),
                    free_flow_travel_time=flow_data.get("freeFlowTravelTime", 0),
                    confidence=flow_data.get("confidence", 0.0),
                    road_closure=flow_data.get("roadClosure", False),
                    congestion_ratio=ratio,
                    congestion_level=level
                )
            )
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"TomTom API Error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching traffic flow: {str(e)}"
            )

@router.post("/route", response_model=BaseResponse[RouteInfoResponse], openapi_extra={"is_public": True})
async def compute_route(payload: RouteComputeRequest):
    """Computes route and traffic-aware travel time using Google Routes API."""
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Maps API key is not configured."
        )

    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.staticDuration"
    }

    body = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": payload.origin_lat,
                    "longitude": payload.origin_lng
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": payload.dest_lat,
                    "longitude": payload.dest_lng
                }
            }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "computeAlternativeRoutes": False
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=body)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("routes"):
                raise HTTPException(status_code=404, detail="No route found between these locations.")
                
            route = data["routes"][0]
            
            # Google Returns duration as "123s"
            duration_str = route.get("duration", "0s").replace("s", "")
            static_duration_str = route.get("staticDuration", "0s").replace("s", "")
            
            return BaseResponse(
                success=True,
                data=RouteInfoResponse(
                    distance_meters=route.get("distanceMeters", 0),
                    duration_seconds=int(static_duration_str),
                    traffic_duration_seconds=int(duration_str),
                    polyline=route.get("polyline", {}).get("encodedPolyline", "")
                )
            )
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Google API Error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error computing route: {str(e)}"
            )
