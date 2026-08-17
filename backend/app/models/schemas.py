"""Pydantic data models and validation schemas for Nagpur Traffic AI."""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CongestionLevel(str, Enum):
    NORMAL = "normal"
    MODERATE = "moderate"
    HEAVY = "heavy"
    SEVERE = "severe"


class SignalPhaseEnum(str, Enum):
    NORTH_SOUTH_GREEN = "NORTH_SOUTH_GREEN"
    NORTH_SOUTH_YELLOW = "NORTH_SOUTH_YELLOW"
    EAST_WEST_GREEN = "EAST_WEST_GREEN"
    EAST_WEST_YELLOW = "EAST_WEST_YELLOW"
    ALL_RED = "ALL_RED"


class VehicleCounts(BaseModel):
    two_wheeler: int = 0
    car: int = 0
    auto_rickshaw: int = 0
    bus: int = 0
    truck: int = 0


class JunctionBase(BaseModel):
    id: str
    name: str
    area: str
    corridor: Optional[str] = None
    lanes: int = 4
    capacity_pcu_hr: int = 4000
    latitude: float
    longitude: float
    has_smart_signal: bool = True


class JunctionLiveStatus(JunctionBase):
    current_volume_pcu_hr: int = 0
    avg_speed_kmh: float = 45.0
    queue_length_meters: float = 0.0
    congestion_level: CongestionLevel = CongestionLevel.NORMAL
    active_signal_phase: SignalPhaseEnum = SignalPhaseEnum.NORTH_SOUTH_GREEN
    green_time_remaining_sec: int = 30
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    vehicle_counts: Optional[VehicleCounts] = None


class TrafficRecordPayload(BaseModel):
    junction_id: str
    timestamp: Optional[datetime] = None
    volume_pcu_hr: int
    avg_speed_kmh: float
    queue_length_meters: float = 0.0
    congestion_level: Optional[CongestionLevel] = None
    vehicle_counts: Optional[VehicleCounts] = None


class PhaseTiming(BaseModel):
    phase_name: str
    green_time_sec: int
    yellow_time_sec: int = 3
    all_red_sec: int = 2


class SignalPlan(BaseModel):
    junction_id: str
    optimal_cycle_length_sec: int
    phases: List[PhaseTiming]
    estimated_delay_reduction_pct: float
    strategy: str = "webster_dynamic"
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class ForecastInterval(BaseModel):
    time_offset_min: int
    predicted_volume_pcu_hr: int
    congestion_probability: float
    status: CongestionLevel


class JunctionForecast(BaseModel):
    junction_id: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    forecasts: List[ForecastInterval]


class CityOverviewKPIs(BaseModel):
    total_monitored_junctions: int
    city_average_speed_kmh: float
    overall_congestion_index: float  # 0 to 100
    active_bottlenecks_count: int
    green_wave_corridors_active: int
    last_updated: datetime = Field(default_factory=datetime.utcnow)
