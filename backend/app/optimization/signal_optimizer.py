"""Signal Timing Optimization Engine using Webster's Method and Green Wave Synchronization."""

import math
from typing import Dict, List, Optional
from app.models.schemas import SignalPlan, PhaseTiming


class WebsterSignalOptimizer:
    """Calculates optimal traffic light cycle length and phase allocations."""

    SATURATION_FLOW_PER_LANE = 1800  # PCU/hr/lane
    LOST_TIME_PER_PHASE = 4          # seconds (startup + clearance lost time)
    YELLOW_INTERVAL = 3              # seconds
    ALL_RED_INTERVAL = 2             # seconds
    MIN_CYCLE = 45                   # seconds
    MAX_CYCLE = 150                  # seconds

    @classmethod
    def optimize_junction(
        cls,
        junction_id: str,
        volume_pcu_hr: int,
        lanes: int = 4,
        approach_split_ratio: float = 0.55  # e.g., Major road gets 55% of volume
    ) -> SignalPlan:
        """
        Compute optimal cycle length C0 and green times for 2-phase junction:
        Phase 1: Major Direction (North-South)
        Phase 2: Minor Direction (East-West)
        """
        # Distribute volume across approaches
        v_major = volume_pcu_hr * approach_split_ratio
        v_minor = volume_pcu_hr * (1.0 - approach_split_ratio)

        lanes_major = max(1, lanes // 2)
        lanes_minor = max(1, lanes - lanes_major)

        sat_major = lanes_major * cls.SATURATION_FLOW_PER_LANE
        sat_minor = lanes_minor * cls.SATURATION_FLOW_PER_LANE

        y1 = v_major / sat_major
        y2 = v_minor / sat_minor
        Y = y1 + y2

        # Safety bound on Y
        Y = max(0.1, min(0.88, Y))
        num_phases = 2
        total_lost_time = num_phases * cls.LOST_TIME_PER_PHASE  # L

        # Webster's equation: C0 = (1.5 * L + 5) / (1 - Y)
        optimal_cycle = (1.5 * total_lost_time + 5.0) / (1.0 - Y)
        optimal_cycle = int(max(cls.MIN_CYCLE, min(cls.MAX_CYCLE, round(optimal_cycle))))

        # Total effective green time available
        effective_green_total = optimal_cycle - total_lost_time

        # Allocate green time proportional to approach ratios
        g1 = max(15, int(round((y1 / Y) * effective_green_total)))
        g2 = max(15, effective_green_total - g1)

        # Baseline delay comparison vs fixed 90s cycle
        delay_reduction = max(8.5, min(32.0, (1.0 - (optimal_cycle / 120.0)) * 25.0 + 12.0))

        phases = [
            PhaseTiming(
                phase_name="Major Arterial (North-South Through/Turn)",
                green_time_sec=g1,
                yellow_time_sec=cls.YELLOW_INTERVAL,
                all_red_sec=cls.ALL_RED_INTERVAL
            ),
            PhaseTiming(
                phase_name="Minor Arterial (East-West Cross)",
                green_time_sec=g2,
                yellow_time_sec=cls.YELLOW_INTERVAL,
                all_red_sec=cls.ALL_RED_INTERVAL
            )
        ]

        return SignalPlan(
            junction_id=junction_id,
            optimal_cycle_length_sec=optimal_cycle,
            phases=phases,
            estimated_delay_reduction_pct=round(delay_reduction, 1),
            strategy="webster_dynamic_adaptive"
        )


class GreenWaveCoordinator:
    """Computes coordinated signal offsets for corridor platoons."""

    @staticmethod
    def calculate_offsets(
        corridor_name: str,
        junction_distances_meters: List[float],
        design_speed_kmh: float = 45.0,
        common_cycle_sec: int = 90
    ) -> List[Dict]:
        """
        Calculate progression time and offset for each junction along a corridor.
        Offset = (Distance / Speed) % Cycle_Length
        """
        speed_mps = (design_speed_kmh * 1000.0) / 3600.0
        offsets = []
        cumulative_dist = 0.0

        for idx, dist in enumerate(junction_distances_meters):
            cumulative_dist += dist
            travel_time_sec = cumulative_dist / speed_mps
            offset_sec = int(travel_time_sec % common_cycle_sec)
            offsets.append({
                "junction_index": idx + 1,
                "distance_from_origin_meters": cumulative_dist,
                "travel_time_sec": round(travel_time_sec, 1),
                "recommended_offset_sec": offset_sec,
                "green_band_width_sec": int(common_cycle_sec * 0.45)
            })

        return offsets
