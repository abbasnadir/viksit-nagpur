"""Signal optimization and corridor synchronization endpoints."""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import SignalPlan
from app.services.traffic_service import traffic_service
from app.optimization.signal_optimizer import WebsterSignalOptimizer, GreenWaveCoordinator

router = APIRouter(prefix="/signals", tags=["Signal Optimization"])


@router.get("/plans/{junction_id}", response_model=SignalPlan)
async def get_optimized_signal_plan(junction_id: str):
    """Compute and retrieve Webster-optimized signal timings for a specific junction."""
    junc = traffic_service.get_junction(junction_id)
    if not junc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Junction '{junction_id}' not found."
        )

    plan = WebsterSignalOptimizer.optimize_junction(
        junction_id=junc.id,
        volume_pcu_hr=junc.current_volume_pcu_hr,
        lanes=junc.lanes
    )
    return plan


@router.get("/green-wave/corridors")
async def get_green_wave_corridor_plan(
    corridor: str = Query("CORRIDOR_WARDHA_RD", description="Corridor ID to coordinate")
):
    """Calculate coordinated signal offsets for green wave corridor progression."""
    # Distance breakdown in meters for Wardha Road intersections:
    # Sitabuldi Variety -> Rahate Colony (~1800m) -> Ajni Sq (~1200m) -> Chhatrapati Sq (~1400m)
    corridor_distances = {
        "CORRIDOR_WARDHA_RD": [1800.0, 1200.0, 1400.0],
        "CORRIDOR_WHC_ROAD": [1400.0, 1100.0],
        "CORRIDOR_CA_ROAD": [2000.0, 1600.0]
    }

    distances = corridor_distances.get(corridor, [1500.0, 1200.0])
    offsets = GreenWaveCoordinator.calculate_offsets(
        corridor_name=corridor,
        junction_distances_meters=distances,
        design_speed_kmh=45.0,
        common_cycle_sec=90
    )

    return {
        "corridor_id": corridor,
        "design_progression_speed_kmh": 45.0,
        "master_cycle_length_sec": 90,
        "coordination_offsets": offsets
    }
