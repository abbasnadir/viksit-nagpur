from fastapi import Request, HTTPException, status, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.base_router import get_base_router
from app.db.session import get_db
from app.models.domain import LocationModel
from app.services.risk_engine import RiskEngine

router = get_base_router(prefix="/risk", tags=["Risk"])

@router.get("/heatmap")
async def get_risk_heatmap(request: Request, db: AsyncSession = Depends(get_db)):
    """Get geographical heatmap data for traffic risk across Nagpur."""
    stmt = select(LocationModel)
    result = await db.execute(stmt)
    locations = result.scalars().all()

    heatmap_points = [
        {
            "id": loc.id,
            "name": loc.name,
            "lat": loc.lat,
            "lng": loc.lng,
            "mapX": loc.map_x,
            "mapY": loc.map_y,
            "riskScore": round(loc.risk_score, 1),
            "riskLevel": loc.risk_level,
            "weight": round(loc.risk_score / 100.0, 2),
            "activeIncidents": loc.active_incidents,
            "officersAssigned": loc.officers_assigned,
        }
        for loc in locations
    ]

    return {
        "points": heatmap_points,
        "totalLocations": len(heatmap_points),
        "highRiskCount": sum(1 for p in heatmap_points if p["riskLevel"] == "High")
    }

@router.get("/rankings")
async def get_risk_rankings(request: Request, db: AsyncSession = Depends(get_db)):
    """Get dynamically updated ranking of locations based on risk score."""
    stmt = select(LocationModel).order_by(desc(LocationModel.risk_score))
    result = await db.execute(stmt)
    locations = result.scalars().all()

    rankings = []
    for rank, loc in enumerate(locations, start=1):
        loc_data = loc.to_dict()
        loc_data["rank"] = rank
        loc_data["isUnmannedHighRisk"] = RiskEngine.is_unmanned_high_risk(
            loc.risk_score, loc.officers_assigned
        )
        rankings.append(loc_data)

    return rankings

@router.get("/{location_id}")
async def get_risk_for_location(location_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get specific risk score, traffic features, and explainability factors for a location."""
    stmt = select(LocationModel).where(LocationModel.id == location_id)
    result = await db.execute(stmt)
    loc = result.scalar_one_or_none()

    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{location_id}' not found"
        )

    loc_dict = loc.to_dict()
    loc_dict["isUnmannedHighRisk"] = RiskEngine.is_unmanned_high_risk(
        loc.risk_score, loc.officers_assigned
    )
    return loc_dict
