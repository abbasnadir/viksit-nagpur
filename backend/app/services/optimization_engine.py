import math
import logging
from typing import List, Dict, Any, Optional
from ortools.linear_solver import pywraplp

logger = logging.getLogger("nagpur_traffic.optimization")

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PoliceOptimizer:
    """Google OR-Tools powered officer allocation and scheduling optimization engine."""

    @staticmethod
    def allocate_officers_to_locations(
        available_officers: List[Dict[str, Any]],
        uncovered_locations: List[Dict[str, Any]],
        all_locations_dict: Dict[str, Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Solves optimal officer-to-location assignment using Mixed Integer Linear Programming (OR-Tools CBC/SCIP).
        """
        if not available_officers or not uncovered_locations:
            return []

        # Create the linear solver with the SCIP backend
        solver = pywraplp.Solver.CreateSolver("SCIP")
        if not solver:
            # Fallback to CBC or basic solver
            solver = pywraplp.Solver.CreateSolver("CBC")
        if not solver:
            logger.warning("OR-Tools solver not available, using heuristic matcher.")
            return PoliceOptimizer._heuristic_allocation(available_officers, uncovered_locations, all_locations_dict)

        num_officers = len(available_officers)
        num_locs = len(uncovered_locations)

        # Decision variables: x[i, j] = 1 if officer i is assigned to location j
        x = {}
        for i in range(num_officers):
            for j in range(num_locs):
                x[i, j] = solver.IntVar(0, 1, f"x_{i}_{j}")

        # Constraint 1: Each officer can be assigned to at most 1 location
        for i in range(num_officers):
            solver.Add(solver.Sum([x[i, j] for j in range(num_locs)]) <= 1)

        # Constraint 2: Each location can receive at most its required additional coverage
        for j in range(num_locs):
            loc = uncovered_locations[j]
            needed = max(1, loc.get("recommendedOfficers", 2) - loc.get("officersAssigned", 0))
            solver.Add(solver.Sum([x[i, j] for i in range(num_officers)]) <= needed)

        # Objective Function:
        # Minimize (Travel Distance + Workload Imbalance Penalty - Risk Priority Reward)
        objective = solver.Objective()

        cost_matrix = {}
        for i in range(num_officers):
            off = available_officers[i]
            # Determine officer starting coordinates
            off_loc_id = off.get("locationId")
            if off_loc_id and off_loc_id in all_locations_dict:
                from_lat = all_locations_dict[off_loc_id]["lat"]
                from_lng = all_locations_dict[off_loc_id]["lng"]
            else:
                # Sitabuldi Police HQ / Zero Mile default reserve coordinates
                from_lat, from_lng = 21.1458, 79.0882

            workload = off.get("workloadPct", 50.0)

            for j in range(num_locs):
                loc = uncovered_locations[j]
                to_lat = loc["lat"]
                to_lng = loc["lng"]

                dist_km = haversine_distance_km(from_lat, from_lng, to_lat, to_lng)
                risk_score = loc.get("riskScore", 50.0)

                # Cost terms:
                # Travel penalty (10 per km) + Workload penalty (0.2 per %) - Risk reward (0.5 per risk pt)
                cost = (dist_km * 8.0) + (workload * 0.15) - (risk_score * 0.4)
                cost_matrix[(i, j)] = (dist_km, cost)
                objective.SetCoefficient(x[i, j], cost)

        objective.SetMinimization()
        status = solver.Solve()

        recommendations = []
        if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
            rec_idx = 1
            for i in range(num_officers):
                for j in range(num_locs):
                    if x[i, j].solution_value() > 0.5:
                        off = available_officers[i]
                        loc = uncovered_locations[j]
                        dist_km, _ = cost_matrix[(i, j)]
                        
                        # ETA estimate based on 25 km/h city travel + 2 min prep
                        eta = max(3, int(round((dist_km / 25.0) * 60.0) + 2))
                        
                        priority = "Critical" if loc.get("riskScore", 0) >= 80 else ("High" if loc.get("riskScore", 0) >= 60 else "Medium")
                        from_name = off.get("locationName") or "Reserve (Unassigned)"
                        
                        reason = f"Allocated to {loc['name']} (Risk: {loc.get('riskScore', 0):.0f}) to resolve coverage gap. Est travel {dist_km:.1f} km."
                        if loc.get("activeIncidents", 0) > 0:
                            reason = f"Active incident response at {loc['name']} with high congestion. Distance {dist_km:.1f} km."

                        recommendations.append({
                            "id": f"DEP_OPT_{rec_idx:03d}",
                            "officerId": off["id"],
                            "officerName": off["name"],
                            "officerBadge": off.get("badgeNo", "NTP-0000"),
                            "fromLocationId": off.get("locationId"),
                            "fromLocationName": from_name,
                            "toLocationId": loc["id"],
                            "toLocationName": loc["name"],
                            "priority": priority,
                            "etaMinutes": eta,
                            "reason": reason,
                            "status": "Pending",
                            "isAI": True,
                        })
                        rec_idx += 1
        else:
            logger.info("Solver failed to find optimal solution, fallback to heuristic.")
            return PoliceOptimizer._heuristic_allocation(available_officers, uncovered_locations, all_locations_dict)

        return recommendations

    @staticmethod
    def _heuristic_allocation(
        available_officers: List[Dict[str, Any]],
        uncovered_locations: List[Dict[str, Any]],
        all_locations_dict: Dict[str, Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Greedy heuristic allocation fallback."""
        recommendations = []
        assigned_officers = set()
        rec_idx = 1

        # Sort locations by risk descending
        sorted_locs = sorted(uncovered_locations, key=lambda x: x.get("riskScore", 0), reverse=True)

        for loc in sorted_locs:
            best_off = None
            min_dist = float("inf")

            for off in available_officers:
                if off["id"] in assigned_officers:
                    continue

                off_loc_id = off.get("locationId")
                if off_loc_id and off_loc_id in all_locations_dict:
                    from_lat = all_locations_dict[off_loc_id]["lat"]
                    from_lng = all_locations_dict[off_loc_id]["lng"]
                else:
                    from_lat, from_lng = 21.1458, 79.0882

                dist = haversine_distance_km(from_lat, from_lng, loc["lat"], loc["lng"])
                if dist < min_dist:
                    min_dist = dist
                    best_off = off

            if best_off:
                assigned_officers.add(best_off["id"])
                eta = max(3, int(round((min_dist / 25.0) * 60.0) + 2))
                priority = "Critical" if loc.get("riskScore", 0) >= 80 else "High"
                recommendations.append({
                    "id": f"DEP_HEUR_{rec_idx:03d}",
                    "officerId": best_off["id"],
                    "officerName": best_off["name"],
                    "officerBadge": best_off.get("badgeNo", "NTP-0000"),
                    "fromLocationId": best_off.get("locationId"),
                    "fromLocationName": best_off.get("locationName") or "Reserve (Unassigned)",
                    "toLocationId": loc["id"],
                    "toLocationName": loc["name"],
                    "priority": priority,
                    "etaMinutes": eta,
                    "reason": f"Heuristic shortest-path allocation to high-risk location ({min_dist:.1f} km).",
                    "status": "Pending",
                    "isAI": True,
                })
                rec_idx += 1

        return recommendations
