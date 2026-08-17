# System Architecture: Nagpur Traffic AI

## 1. High-Level Architecture Overview

Nagpur Traffic AI operates as a distributed system structured into four primary tiers:
1. **Data Ingestion & Simulation Layer**: Camera/sensor streams, OSM road graphs, synthetic telemetry feeds.
2. **Backend & Computation Engine (FastAPI)**: Business logic, spatial queries, traffic state cache, WebSocket distributor.
3. **Intelligence & Optimization Core (ML + Algorithms)**: Time-series forecasting models, Webster cycle calculators, Green Wave corridor coordinators.
4. **Presentation & GIS Dashboard (React + Vite)**: Real-time map rendering, signal timeline controls, and analytical telemetry.

```mermaid
graph TD
    subgraph Data Sources & Telemetry
        CAM[Junction Cameras / Edge Sensors] -->|REST/MQTT| INGEST[Ingestion & Simulation Service]
        OSM[OpenStreetMap GIS Data] -->|GeoJSON| INGEST
    end

    subgraph Backend Core (FastAPI)
        INGEST --> API[FastAPI Gateway]
        API --> STATE[Traffic State & Analytics Service]
        STATE <--> DB[(Time-Series DB / Cache)]
    end

    subgraph Intelligence & Optimization
        STATE --> ML[ML Congestion Predictor]
        STATE --> OPT[Signal Timing Optimizer]
        OPT --> GREEN[Green Wave Coordinator]
        ML --> PREDS[Forecast Store]
    end

    subgraph Frontend Dashboard
        API -->|WebSocket Stream| WS_CLIENT[Live WebSocket Client]
        API -->|REST API| REST_CLIENT[Dashboard UI Services]
        WS_CLIENT --> MAP[Interactive Map & GIS Viewer]
        REST_CLIENT --> CTRL[Signal Controller & Analytics]
    end
```

---

## 2. Component Specifications

### 2.1 Backend (`backend/app`)
- **Framework:** FastAPI (Python 3.10+) with asynchronous event loop.
- **Routing:** Versioned API (`/api/v1`) with endpoints for `/traffic`, `/signals`, `/predictions`, and `/health`.
- **WebSockets:** `/api/v1/ws/traffic` pushes state changes and simulated detector ticks every 2 seconds to connected clients.
- **Pydantic Data Models:** Strict validation for Junctions, FlowRates, SignalPhases, and Forecasts.

### 2.2 Optimization Engine (`backend/app/optimization`)
- **Webster's Optimal Cycle Equation:**
  $$C_0 = \frac{1.5 L + 5}{1 - Y}$$
  Where $L$ is total lost time per cycle, and $Y = \sum y_i$ (sum of critical phase flow ratios).
- **Green Wave Progression:** Computes phase offsets along connected corridors based on link distances and target design speeds ($40\text{--}50\text{ km/h}$).

### 2.3 Machine Learning Pipeline (`ml/`)
- **Feature Pipeline:** Ingests lag volumes ($t-1, t-2, t-3$), rolling means, hour-of-day sin/cos cyclical encodings, day-of-week, and junction adjacency matrices.
- **Models:** Gradient Boosted Trees (XGBoost / LightGBM) and Spatial-Temporal sequence models for multi-step ahead prediction.

### 2.4 Frontend Dashboard (`frontend/`)
- **Build Tool:** Vite + React.
- **State Management:** Reactive hooks with automatic WebSocket reconnection and fallback polling.
- **Design System:** Custom CSS design system with dark-mode aesthetic, glowing status badges, and responsive layout.

---

## 3. Data Flow

1. **Junction Tick:** `scripts/simulate_traffic_feed.py` or sensor stream posts junction flow data to `/api/v1/traffic/record`.
2. **State Ingestion:** `TrafficService` updates the in-memory junction state and rolling time-window buffer.
3. **Real-Time Prediction:** `ml/predictor.py` computes 15/30/60 min congestion predictions.
4. **Adaptive Signals:** `optimization/signal_optimizer.py` recalculates recommended phase splits if congestion crosses threshold.
5. **Client Broadcast:** WebSocket transmits updated junction states, signal plans, and active alerts to the frontend dashboard.
