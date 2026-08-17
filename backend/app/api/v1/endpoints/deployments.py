import uuid
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.base_router import get_base_router
from app.db.session import get_db
from app.models.domain import DeploymentModel, OfficerModel, LocationModel
from app.schemas.requests import (
    DeploymentRecommendRequest,
    DeploymentApproveRequest,
    DeploymentOverrideRequest
)
from app.services.optimization_engine import PoliceOptimizer

router = get_base_router(prefix="/deployments", tags=["Deployments"])

@router.get("")
async def get_deployments(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all current deployments and recommendations."""
    stmt = select(DeploymentModel)
    result = await db.execute(stmt)
    deployments = result.scalars().all()
    return [dep.to_dict() for dep in deployments]

@router.post("/recommend")
async def recommend_deployment(
    payload: DeploymentRecommendRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get AI recommendation for officer allocation to a specific location."""
    # Fetch location
    loc_stmt = select(LocationModel).where(LocationModel.id == payload.location_id)
    loc_res = await db.execute(loc_stmt)
    target_loc = loc_res.scalar_one_or_none()

    if not target_loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{payload.location_id}' not found"
        )

    # Fetch all locations dict for coordinates
    all_loc_stmt = select(LocationModel)
    all_loc_res = await db.execute(all_loc_stmt)
    all_locations_dict = {l.id: l.to_dict() for l in all_loc_res.scalars().all()}

    # Fetch available or reserve officers
    off_stmt = select(OfficerModel)
    off_res = await db.execute(off_stmt)
    all_officers = [o.to_dict() for o in off_res.scalars().all()]

    candidates = [
        o for o in all_officers
        if o["availability"] in ["Available", "On Break"] or o["workloadPct"] < 60
    ]

    recommendations = PoliceOptimizer.allocate_officers_to_locations(
        available_officers=candidates,
        uncovered_locations=[target_loc.to_dict()],
        all_locations_dict=all_locations_dict
    )

    if not recommendations:
        # Fallback to any available officer
        reserve_off = next((o for o in all_officers if o["availability"] == "Available"), all_officers[0])
        recommendations = [{
            "id": f"DEP_REC_{uuid.uuid4().hex[:4].upper()}",
            "officerId": reserve_off["id"],
            "officerName": reserve_off["name"],
            "officerBadge": reserve_off["badgeNo"],
            "fromLocationId": reserve_off["locationId"],
            "fromLocationName": reserve_off["locationName"] or "Reserve (Unassigned)",
            "toLocationId": target_loc.id,
            "toLocationName": target_loc.name,
            "priority": payload.priority.title(),
            "etaMinutes": 8,
            "reason": f"Heuristic assignment to resolve coverage requirement at {target_loc.name}.",
            "status": "Pending",
            "isAI": True,
        }]

    return recommendations

@router.post("/approve")
async def approve_deployment(
    payload: DeploymentApproveRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Control-room operator approves an AI deployment recommendation."""
    # Find deployment
    dep_stmt = select(DeploymentModel).where(DeploymentModel.id == payload.deployment_id)
    dep_res = await db.execute(dep_stmt)
    deployment = dep_res.scalar_one_or_none()

    # Find officer
    off_stmt = select(OfficerModel).where(OfficerModel.id == payload.officer_id)
    off_res = await db.execute(off_stmt)
    officer = off_res.scalar_one_or_none()

    if not officer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Officer '{payload.officer_id}' not found"
        )

    to_loc_id = deployment.to_location_id if deployment else "LOC_VARIETY"
    from_loc_id = officer.location_id

    # Update officer
    to_loc_stmt = select(LocationModel).where(LocationModel.id == to_loc_id)
    to_loc_res = await db.execute(to_loc_stmt)
    to_location = to_loc_res.scalar_one_or_none()

    officer.location_id = to_loc_id
    officer.location_name = to_location.name if to_location else "Assigned Junction"
    officer.availability = "On Duty"
    officer.workload_pct = min(95.0, officer.workload_pct + 15.0)

    # Update destination location count
    if to_location:
        to_location.officers_assigned += 1

    # Decrement source location count if applicable
    if from_loc_id:
        from_loc_stmt = select(LocationModel).where(LocationModel.id == from_loc_id)
        from_loc_res = await db.execute(from_loc_stmt)
        from_location = from_loc_res.scalar_one_or_none()
        if from_location and from_location.officers_assigned > 0:
            from_location.officers_assigned -= 1

    # Update deployment status if existing
    if deployment:
        deployment.status = "Approved"
    else:
        deployment = DeploymentModel(
            id=payload.deployment_id,
            officer_id=officer.id,
            officer_name=officer.name,
            officer_badge=officer.badge_no,
            from_location_id=from_loc_id,
            from_location_name="Previous Assignment",
            to_location_id=to_loc_id,
            to_location_name=to_location.name if to_location else "Assigned Junction",
            priority="High",
            eta_minutes=7,
            reason="Approved operator assignment.",
            status="Approved",
            is_ai=True,
        )
        db.add(deployment)

    await db.commit()

    return {
        "deployment": deployment.to_dict(),
        "officer": officer.to_dict(),
        "message": f"Deployment approved. Officer {officer.name} ({officer.badge_no}) dispatched to {officer.location_name}."
    }

@router.post("/override")
async def override_deployment(
    payload: DeploymentOverrideRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Control-room operator manually overrides an AI deployment."""
    dep_stmt = select(DeploymentModel).where(DeploymentModel.id == payload.deployment_id)
    dep_res = await db.execute(dep_stmt)
    deployment = dep_res.scalar_one_or_none()

    new_off_stmt = select(OfficerModel).where(OfficerModel.id == payload.new_officer_id)
    new_off_res = await db.execute(new_off_stmt)
    new_officer = new_off_res.scalar_one_or_none()

    if not new_officer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"New officer '{payload.new_officer_id}' not found"
        )

    if deployment:
        deployment.officer_id = new_officer.id
        deployment.officer_name = new_officer.name
        deployment.officer_badge = new_officer.badge_no
        deployment.reason = f"[Manual Override] {payload.reason}"
        deployment.status = "Modified"
        deployment.is_ai = False
    else:
        deployment = DeploymentModel(
            id=payload.deployment_id,
            officer_id=new_officer.id,
            officer_name=new_officer.name,
            officer_badge=new_officer.badge_no,
            from_location_id=new_officer.location_id,
            from_location_name=new_officer.location_name or "Reserve",
            to_location_id="LOC_VARIETY",
            to_location_name="Variety Square",
            priority="High",
            eta_minutes=9,
            reason=f"[Manual Override] {payload.reason}",
            status="Modified",
            is_ai=False,
        )
        db.add(deployment)

    await db.commit()

    return {
        "deployment": deployment.to_dict(),
        "message": f"Deployment overridden successfully with officer {new_officer.name}."
    }
