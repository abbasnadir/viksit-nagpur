"""Traffic State Management and Telemetry Processing Service."""

import json
import os
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from fastapi import WebSocket

from app.core.config import settings
from app.models.schemas import (
    JunctionLiveStatus,
    TrafficRecordPayload,
    CongestionLevel,
    SignalPhaseEnum,
    CityOverviewKPIs,
    VehicleCounts,
)


class TrafficService:
    """Singleton service managing real-time digital twin state of Nagpur traffic network."""

    def __init__(self):
        self.junctions: Dict[str, JunctionLiveStatus] = {}
        self.active_websockets: Set[WebSocket] = set()
        self._load_initial_junctions()

    def _load_initial_junctions(self):
        geojson_path = os.path.join(settings.DATA_GEOJSON_DIR, "nagpur_junctions.geojson")
        if os.path.exists(geojson_path):
            try:
                with open(geojson_path, "r") as f:
                    data = json.load(f)
                for feat in data.get("features", []):
                    props = feat["properties"]
                    coords = feat["geometry"]["coordinates"]  # [lng, lat]
                    j_id = props["id"]
                    cap = props.get("capacity_pcu_hr", 4000)

                    # Initial realistic state
                    init_vol = int(cap * random.uniform(0.45, 0.75))
                    speed = max(15.0, round(52.0 * (1.0 - (init_vol / (cap * 1.3))), 1))
                    
                    self.junctions[j_id] = JunctionLiveStatus(
                        id=j_id,
                        name=props.get("name", j_id),
                        area=props.get("area", "Nagpur Urban"),
                        corridor=props.get("corridor"),
                        lanes=props.get("lanes", 4),
                        capacity_pcu_hr=cap,
                        latitude=coords[1],
                        longitude=coords[0],
                        has_smart_signal=props.get("has_smart_signal", True),
                        current_volume_pcu_hr=init_vol,
                        avg_speed_kmh=speed,
                        queue_length_meters=round((init_vol / cap) * 50.0, 1),
                        congestion_level=CongestionLevel.MODERATE if init_vol > cap * 0.6 else CongestionLevel.NORMAL,
                        active_signal_phase=SignalPhaseEnum.NORTH_SOUTH_GREEN,
                        green_time_remaining_sec=random.randint(10, 45),
                        last_updated=datetime.now(timezone.utc),
                        vehicle_counts=VehicleCounts(
                            two_wheeler=int(init_vol * 0.45),
                            car=int(init_vol * 0.20),
                            auto_rickshaw=int(init_vol * 0.10),
                            bus=max(1, int(init_vol * 0.01)),
                            truck=max(0, int(init_vol * 0.005))
                        )
                    )
                print(f"Loaded {len(self.junctions)} junctions from {geojson_path}")
            except Exception as e:
                print(f"Failed to load GeoJSON junctions: {e}")
        else:
            print(f"GeoJSON not found at {geojson_path}. Waiting for telemetry.")

    def get_all_junctions(self) -> List[JunctionLiveStatus]:
        return list(self.junctions.values())

    def get_junction(self, junction_id: str) -> Optional[JunctionLiveStatus]:
        return self.junctions.get(junction_id)

    async def record_telemetry(self, record: TrafficRecordPayload) -> JunctionLiveStatus:
        """Update junction state with incoming tick and notify WebSocket clients."""
        j_id = record.junction_id
        if j_id in self.junctions:
            curr = self.junctions[j_id]
            curr.current_volume_pcu_hr = record.volume_pcu_hr
            curr.avg_speed_kmh = record.avg_speed_kmh
            curr.queue_length_meters = record.queue_length_meters
            curr.last_updated = record.timestamp or datetime.now(timezone.utc)

            # Determine congestion level if not provided
            if record.congestion_level:
                curr.congestion_level = record.congestion_level
            else:
                ratio = record.volume_pcu_hr / max(1, curr.capacity_pcu_hr)
                if ratio > 1.05:
                    curr.congestion_level = CongestionLevel.SEVERE
                elif ratio > 0.82:
                    curr.congestion_level = CongestionLevel.HEAVY
                elif ratio > 0.55:
                    curr.congestion_level = CongestionLevel.MODERATE
                else:
                    curr.congestion_level = CongestionLevel.NORMAL

            if record.vehicle_counts:
                curr.vehicle_counts = record.vehicle_counts

            # Signal countdown simulation
            curr.green_time_remaining_sec = max(2, (curr.green_time_remaining_sec - 3) % 45)

            await self.broadcast_update({
                "type": "JUNCTION_UPDATE",
                "data": curr.model_dump(mode="json")
            })
            return curr
        else:
            raise KeyError(f"Junction {j_id} not registered")

    def get_city_kpis(self) -> CityOverviewKPIs:
        if not self.junctions:
            return CityOverviewKPIs(
                total_monitored_junctions=0,
                city_average_speed_kmh=0.0,
                overall_congestion_index=0.0,
                active_bottlenecks_count=0,
                green_wave_corridors_active=3,
                last_updated=datetime.now(timezone.utc)
            )

        juncs = list(self.junctions.values())
        avg_speed = sum(j.avg_speed_kmh for j in juncs) / len(juncs)
        severe_count = sum(1 for j in juncs if j.congestion_level in [CongestionLevel.HEAVY, CongestionLevel.SEVERE])
        
        # Congestion index: 0-100
        avg_load_ratio = sum(j.current_volume_pcu_hr / max(1, j.capacity_pcu_hr) for j in juncs) / len(juncs)
        congestion_index = min(100.0, round(avg_load_ratio * 75.0, 1))

        return CityOverviewKPIs(
            total_monitored_junctions=len(juncs),
            city_average_speed_kmh=round(avg_speed, 1),
            overall_congestion_index=congestion_index,
            active_bottlenecks_count=severe_count,
            green_wave_corridors_active=3,
            last_updated=datetime.now(timezone.utc)
        )

    # --- WebSocket Connections ---
    async def connect_ws(self, websocket: WebSocket):
        await websocket.accept()
        self.active_websockets.add(websocket)

    def disconnect_ws(self, websocket: WebSocket):
        self.active_websockets.discard(websocket)

    async def broadcast_update(self, message: dict):
        disconnected = set()
        for ws in self.active_websockets:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.add(ws)
        for ws in disconnected:
            self.active_websockets.discard(ws)


traffic_service = TrafficService()
