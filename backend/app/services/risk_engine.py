import math
from datetime import datetime
from typing import Dict, List, Any, Tuple

class RiskEngine:
    """Explainable traffic risk evaluation engine for Nagpur junctions."""

    @staticmethod
    def calculate_location_risk(
        avg_speed_kmh: float,
        volume_pcu_hr: float,
        queue_length_m: float,
        active_incidents: int,
        officers_assigned: int,
        incident_severities: List[str] = None,
        base_speed: float = 45.0,
        capacity_pcu_hr: float = 4000.0,
    ) -> Tuple[float, str, List[str]]:
        """
        Calculates 0-100 risk score, risk level, and top contributing explainability factors.
        """
        score = 20.0  # baseline urban risk
        factors = []

        # 1. Congestion & Speed reduction
        speed_ratio = max(0.0, min(1.0, avg_speed_kmh / base_speed))
        speed_penalty = (1.0 - speed_ratio) * 35.0
        score += speed_penalty
        if speed_ratio < 0.4:
            factors.append(f"Severe speed reduction ({avg_speed_kmh:.0f} km/h vs {base_speed:.0f} km/h baseline)")
        elif speed_ratio < 0.65:
            factors.append(f"Moderate speed reduction ({avg_speed_kmh:.0f} km/h)")

        # 2. Volume vs Capacity
        vc_ratio = volume_pcu_hr / capacity_pcu_hr
        volume_penalty = min(30.0, max(0.0, (vc_ratio - 0.5) * 30.0))
        score += volume_penalty
        if vc_ratio > 0.9:
            factors.append(f"High vehicle volume ({volume_pcu_hr:.0f} PCU/hr, {(vc_ratio*100):.0f}% capacity)")

        # 3. Queue Length
        if queue_length_m > 50:
            score += 15.0
            factors.append(f"Long vehicle queue ({queue_length_m:.0f}m spillback)")
        elif queue_length_m > 25:
            score += 8.0

        # 4. Incident severity impacts
        if incident_severities:
            for sev in incident_severities:
                s = sev.lower()
                if s == "critical":
                    score += 25.0
                    factors.append("Active Critical Incident on corridor")
                elif s == "severe":
                    score += 18.0
                    factors.append("Active Severe Collision / Blockage")
                elif s == "moderate":
                    score += 10.0
                    factors.append("Active Moderate Incident")
                elif s == "minor":
                    score += 5.0
        elif active_incidents > 0:
            score += min(30.0, active_incidents * 12.0)
            factors.append(f"{active_incidents} active incident(s) reported")

        # 5. Peak Hour Time Factor
        current_hour = datetime.now().hour
        is_peak = (8 <= current_hour <= 11) or (17 <= current_hour <= 20)
        if is_peak:
            score += 10.0
            factors.append("Peak rush hour traffic volume overlap")

        # 6. Officer Coverage Impact
        if officers_assigned == 0:
            score += 8.0
            factors.append("Zero police officer coverage currently assigned")
        else:
            # Officers mitigate risk slightly by active manual management
            mitigation = min(15.0, officers_assigned * 3.5)
            score = max(5.0, score - mitigation)

        # Normalize score between 0 and 100
        final_score = max(5.0, min(100.0, score))

        if final_score >= 70.0:
            level = "High"
        elif final_score >= 40.0:
            level = "Medium"
        else:
            level = "Low"

        if not factors:
            factors.append("Normal traffic progression within expected bounds")

        return round(final_score, 1), level, factors[:4]

    @staticmethod
    def is_unmanned_high_risk(risk_score: float, officers_assigned: int) -> bool:
        """Flags high risk unmanned location needing immediate deployment priority."""
        return risk_score >= 70.0 and officers_assigned == 0
