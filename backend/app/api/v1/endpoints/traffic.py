from fastapi import Request, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.base_router import get_base_router
from app.db.session import get_db
from app.models.domain import LocationModel

router = get_base_router(prefix="/traffic", tags=["Traffic"])

@router.get("/{location_id}")
async def get_traffic_for_location(location_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get current traffic telemetry and congestion metrics for a specific location."""
    stmt = select(LocationModel).where(LocationModel.id == location_id)
    result = await db.execute(stmt)
    loc = result.scalar_one_or_none()

    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{location_id}' not found"
        )

    # Derived traffic metrics (e.g. Free flow vs current speed delay)
    base_speed = 45.0
    delay_pct = max(0.0, ((base_speed - loc.avg_speed_kmh) / base_speed) * 100.0)

    return {
        "locationId": loc.id,
        "locationName": loc.name,
        "corridor": loc.corridor,
        "avgSpeedKmh": loc.avg_speed_kmh,
        "baseSpeedKmh": base_speed,
        "speedReductionPct": round(delay_pct, 1),
        "volumePcuHr": loc.volume_pcu_hr,
        "queueLengthM": loc.queue_length_m,
        "trafficCondition": loc.traffic_condition,
        "activeIncidents": loc.active_incidents,
        "officersAssigned": loc.officers_assigned,
        "capacityUtilizationPct": round((loc.volume_pcu_hr / 4000.0) * 100.0, 1),
    }
