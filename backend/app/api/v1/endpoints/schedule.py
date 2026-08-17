from fastapi import Request, HTTPException, status
from app.api.v1.base_router import get_base_router
from app.schemas.requests import ScheduleOptimizeRequest

router = get_base_router(prefix="/schedule", tags=["Schedule"])

@router.get("")
async def get_schedule(request: Request):
    """Get officers schedule."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")

@router.post("/optimize")
async def optimize_schedule(payload: ScheduleOptimizeRequest, request: Request):
    """Optimize officer schedules using Google OR-Tools."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")
