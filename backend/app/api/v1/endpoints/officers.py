from fastapi import Request, HTTPException, status
from app.api.v1.base_router import get_base_router

router = get_base_router(prefix="/officers", tags=["Officers"])

@router.get("")
async def get_officers(request: Request):
    """Get all officers and their statuses."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")

@router.get("/workload")
async def get_officers_workload(request: Request):
    """Get officers workload distribution metrics."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")
