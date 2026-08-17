import httpx
from fastapi import APIRouter, HTTPException, status
from app.api.router import get_base_router
from app.schemas.requests import RouteComputeRequest
from app.schemas.responses import RouteInfoResponse
from app.core.config import settings

router = get_base_router(prefix="/traffic", tags=["Traffic"])

@router.post("/route", response_model=RouteInfoResponse, openapi_extra={"is_public": True})
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
            
            return RouteInfoResponse(
                distance_meters=route.get("distanceMeters", 0),
                duration_seconds=int(static_duration_str),
                traffic_duration_seconds=int(duration_str),
                polyline=route.get("polyline", {}).get("encodedPolyline", "")
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
