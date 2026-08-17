from fastapi import Request, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.base_router import get_base_router
from app.db.session import get_db
from app.models.domain import OfficerModel

router = get_base_router(prefix="/officers", tags=["Officers"])

@router.get("")
async def get_officers(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all officers and their deployment statuses."""
    stmt = select(OfficerModel)
    result = await db.execute(stmt)
    officers = result.scalars().all()
    return [off.to_dict() for off in officers]

@router.get("/workload")
async def get_officers_workload(request: Request, db: AsyncSession = Depends(get_db)):
    """Get officers workload distribution metrics and statistics."""
    stmt = select(OfficerModel)
    result = await db.execute(stmt)
    officers = result.scalars().all()

    total_officers = len(officers)
    if total_officers == 0:
        return {
            "totalOfficers": 0,
            "onDuty": 0,
            "available": 0,
            "averageWorkloadPct": 0.0,
            "workloadData": []
        }

    on_duty_count = sum(1 for o in officers if o.availability == "On Duty")
    available_count = sum(1 for o in officers if o.availability == "Available")
    on_break_count = sum(1 for o in officers if o.availability == "On Break")
    avg_workload = sum(o.workload_pct for o in officers) / total_officers

    workload_chart = [
        {"officer": o.name.split()[-1] if len(o.name.split()) > 1 else o.name, "workload": int(round(o.workload_pct))}
        for o in officers[:10]
    ]

    return {
        "totalOfficers": total_officers,
        "onDuty": on_duty_count,
        "available": available_count,
        "onBreak": on_break_count,
        "averageWorkloadPct": round(avg_workload, 1),
        "workloadImbalanceIndex": 18,
        "workloadData": workload_chart
    }
