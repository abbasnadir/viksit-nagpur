from fastapi import Request, HTTPException, status
from app.api.v1.base_router import get_base_router
from app.schemas.requests import IncidentReportRequest

router = get_base_router(prefix="/incidents", tags=["Incidents"])

@router.get("")
async def get_incidents(request: Request):
    """Get a list of all active incidents."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")

@router.post("/report")
async def report_incident(payload: IncidentReportRequest, request: Request):
    """Public API for reporting incidents with input validation."""
    # Data is validated via payload, DB insertion logic pending
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Database integration pending")
