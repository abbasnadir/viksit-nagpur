from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.base_router import get_base_router
from app.db.session import get_db
from app.schemas.requests import RedeploymentSimulateRequest
from app.services.simulation_service import SimulationService

router = get_base_router(prefix="/redeployment", tags=["Redeployment"])

@router.post("/simulate")
async def simulate_redeployment(
    payload: RedeploymentSimulateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Simulate dynamic redeployment in response to an incident."""
    result = await SimulationService.simulate_incident_redeployment(
        db=db,
        incident_id=payload.incident_id
    )
    return result
