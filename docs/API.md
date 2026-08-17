# API Documentation: Nagpur Traffic AI

Base URL: `http://localhost:8000/api/v1`

---

## 1. Traffic Telemetry Endpoints

### 1.1 List All Monitored Junctions
- **GET** `/traffic/junctions`
- **Description:** Returns metadata, coordinates, and current live status for all junctions in Nagpur.
- **Response:**
```json
[
  {
    "id": "J_SITABULDI_01",
    "name": "Variety Square (Sitabuldi)",
    "area": "Sitabuldi",
    "latitude": 21.1466,
    "longitude": 79.0831,
    "corridor": "Wardha Road / Amravati Link",
    "lanes": 4,
    "current_volume_pcu_hr": 3200,
    "avg_speed_kmh": 22.5,
    "congestion_level": "heavy",
    "active_signal_phase": "NORTH_SOUTH_GREEN",
    "last_updated": "2026-08-17T13:45:00Z"
  }
]
```

### 1.2 Get Single Junction Details
- **GET** `/traffic/junctions/{junction_id}`
- **Parameters:** `junction_id` (string, e.g., `J_SITABULDI_01`)
- **Response:** Detailed metrics including approach flow breakdown, queue lengths, and historical hourly trend.

### 1.3 Record Real-Time Flow Telemetry
- **POST** `/traffic/record`
- **Description:** Ingest sensor or camera tick.
- **Request Body:**
```json
{
  "junction_id": "J_SITABULDI_01",
  "timestamp": "2026-08-17T13:45:00Z",
  "vehicle_counts": {
    "two_wheeler": 180,
    "car": 75,
    "auto_rickshaw": 35,
    "bus": 8,
    "truck": 4
  },
  "avg_speed_kmh": 24.2,
  "queue_length_meters": 45.0
}
```

---

## 2. Signal Optimization Endpoints

### 2.1 Get Recommended Signal Timings
- **GET** `/signals/plans/{junction_id}`
- **Description:** Calculates and returns the optimized Webster cycle and phase splits based on current approach volumes.
- **Response:**
```json
{
  "junction_id": "J_SITABULDI_01",
  "optimal_cycle_length_sec": 90,
  "phases": [
    {
      "phase_name": "North-South Through & Right",
      "green_time_sec": 42,
      "yellow_time_sec": 3,
      "all_red_sec": 2
    },
    {
      "phase_name": "East-West Through & Right",
      "green_time_sec": 38,
      "yellow_time_sec": 3,
      "all_red_sec": 2
    }
  ],
  "estimated_delay_reduction_pct": 18.5,
  "strategy": "webster_dynamic"
}
```

### 2.2 Green Wave Corridor Coordination
- **GET** `/signals/corridors/green-wave`
- **Query Params:** `corridor_id` (e.g., `CORRIDOR_WARDHA_RD`)
- **Response:** Offset timings and synchronized speeds across contiguous junctions along the corridor.

---

## 3. Machine Learning Prediction Endpoints

### 3.1 Get Congestion Forecast
- **GET** `/predictions/forecast/{junction_id}`
- **Query Params:** `horizon_minutes` (default: `60`)
- **Response:**
```json
{
  "junction_id": "J_SITABULDI_01",
  "forecasts": [
    { "time_offset_min": 15, "predicted_volume_pcu_hr": 3450, "congestion_probability": 0.82, "status": "heavy" },
    { "time_offset_min": 30, "predicted_volume_pcu_hr": 3800, "congestion_probability": 0.91, "status": "severe" },
    { "time_offset_min": 45, "predicted_volume_pcu_hr": 3300, "congestion_probability": 0.74, "status": "heavy" },
    { "time_offset_min": 60, "predicted_volume_pcu_hr": 2600, "congestion_probability": 0.45, "status": "moderate" }
  ]
}
```

---

## 4. WebSocket Real-Time Stream

- **WS** `/ws/traffic`
- **Description:** Bi-directional real-time feed pushing live updates for all monitored junctions every 2 seconds.
- **Message Payload:** JSON with current tick, speed, volume, and active alerts.
