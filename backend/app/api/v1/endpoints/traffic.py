from fastapi import Request, HTTPException, status
from app.api.v1.base_router import get_base_router

router = get_base_router(prefix="/traffic", tags=["Traffic"])

@router.get("/{location_id}")
async def get_traffic_for_location(location_id: str, request: Request):
    """Get current traffic details for a specific location."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")
