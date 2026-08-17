import uuid
from datetime import datetime
from typing import Optional
from fastapi import Request, HTTPException, status, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.base_router import get_base_router
from app.db.session import get_db
from app.models.domain import IncidentModel, LocationModel
from app.schemas.requests import IncidentReportRequest
from app.services.risk_engine import RiskEngine

router = get_base_router(prefix="/incidents", tags=["Incidents"])

@router.get("")
async def get_incidents(
    request: Request,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db)
):
    """Get a list of all active and recent incidents."""
    stmt = select(IncidentModel).order_by(desc(IncidentModel.reported_at))
    if status_filter:
        stmt = stmt.where(IncidentModel.status == status_filter)

    result = await db.execute(stmt)
    incidents = result.scalars().all()
    return [inc.to_dict() for inc in incidents]

@router.post("/report")
async def report_incident(
    payload: IncidentReportRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Public API for reporting incidents with input validation and instant risk update."""
    # Find matching or closest location by name search
    loc_stmt = select(LocationModel)
    loc_res = await db.execute(loc_stmt)
    locations = loc_res.scalars().all()

    matched_loc = None
    payload_loc_lower = payload.location.lower()
    for loc in locations:
        if loc.name.lower() in payload_loc_lower or loc.area.lower() in payload_loc_lower or loc.id.lower() in payload_loc_lower:
            matched_loc = loc
            break

    if not matched_loc:
        # Default to Sitabuldi / Variety Square if general Nagpur mention
        matched_loc = locations[0] if locations else None

    incident_id = f"INC_{uuid.uuid4().hex[:6].upper()}"
    new_incident = IncidentModel(
        id=incident_id,
        type=payload.incident_type.title(),
        location_id=matched_loc.id if matched_loc else "LOC_NAGPUR_CENTRAL",
        location_name=matched_loc.name if matched_loc else payload.location,
        severity="Severe" if "accident" in payload.incident_type.lower() else "Moderate",
        short_description=payload.description[:60],
        description=payload.description,
        reported_at=datetime.now().isoformat(),
        status="Active",
        officer_assigned=None,
        estimated_clearance_min=30,
        photo_url=str(payload.photo_url) if payload.photo_url else None,
        source="citizen",
    )
    db.add(new_incident)

    # Recalculate risk for the matched location
    if matched_loc:
        matched_loc.active_incidents += 1
        new_score, new_level, factors = RiskEngine.calculate_location_risk(
            avg_speed_kmh=max(8.0, matched_loc.avg_speed_kmh - 8.0),
            volume_pcu_hr=matched_loc.volume_pcu_hr + 300,
            queue_length_m=matched_loc.queue_length_m + 25,
            active_incidents=matched_loc.active_incidents,
            officers_assigned=matched_loc.officers_assigned,
            incident_severities=[new_incident.severity]
        )
        matched_loc.risk_score = new_score
        matched_loc.risk_level = new_level
        matched_loc.risk_factors = factors
        matched_loc.traffic_condition = "Severely Congested" if new_level == "High" else "Congested"

    await db.commit()

    return {
        "incident": new_incident.to_dict(),
        "message": "Incident reported successfully. Control room notified and risk model recalculated."
    }
