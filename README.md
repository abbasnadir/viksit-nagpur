# 🚦 Nagpur Traffic AI

> **Intelligent Traffic Monitoring, Real-Time Congestion Prediction & Adaptive Signal Optimization for Nagpur City.**

---

## 📌 Overview

**Nagpur Traffic AI** is an end-to-end intelligent transportation system designed to address urban mobility challenges in Nagpur (e.g., Sitabuldi, Dharampeth, Sadar, Wardha Road, Central Avenue). The platform ingests real-time and simulated sensor data, forecasts traffic bottlenecks using Machine Learning, and computes optimal green-light phase timings to enable **Green Waves** and minimize vehicle idling.

---

## 🗂 Repository Structure

```
nagpur-traffic-ai/
│
├── frontend/          # React + Vite UI Dashboard & Live GIS Map
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   └── package.json
│
├── backend/           # FastAPI REST & WebSocket Engine
│   ├── app/
│   │   ├── api/          # API routes (Traffic, Signals, Predictions)
│   │   ├── models/       # Pydantic domain models & schemas
│   │   ├── services/     # Traffic state & aggregation services
│   │   ├── ml/           # Model inference engine
│   │   └── optimization/ # Signal timing & green wave algorithms
│   ├── tests/            # Pytest test suite
│   └── requirements.txt
│
├── ml/                # Machine Learning Training Pipeline
│   ├── notebooks/     # Exploratory analysis & experiments
│   ├── src/           # Feature engineering, training, evaluation
│   └── models/        # Checkpoints & serialized models
│
├── data/              # Data storage
│   ├── raw/           # Raw sensor & camera logs
│   ├── processed/     # Processed feature matrices
│   └── geojson/       # Nagpur intersections & corridors GeoJSON
│
├── scripts/           # Simulations & ETL
│   ├── simulate_traffic_feed.py  # Real-time traffic stream simulator
│   ├── seed_demo_data.py         # Seed historical data & predictions
│   └── import_osm_data.py        # OpenStreetMap road graph parser
│
├── docs/              # System Documentation
│   ├── PRD.md                    # Product Requirements Document
│   ├── ARCHITECTURE.md           # Architecture & Data Flow
│   └── API.md                    # REST & WebSocket API Specs
│
├── .env.example
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- *(Optional)* **Docker & Docker Compose**

---

### Option 1: Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-org/nagpur-traffic-ai.git
cd nagpur-traffic-ai

# Copy environment variables
cp .env.example .env

# Build and start services
docker-compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

#### 3. Run Traffic Simulation
In a separate terminal, launch the live junction sensor stream simulator:
```bash
python scripts/simulate_traffic_feed.py
```

---

## 📊 Key Features

- **🗺️ Live Interactive City Map**: Visualizes real-time congestion levels across major Nagpur junctions (Variety Square, Law College Square, Shankar Nagar, RBI Square, Medical Square, etc.).
- **🤖 Short-Term Congestion Forecasting**: 15–60 min predictive modeling using historical volume, time cyclicality, and spatial neighborhood graphs.
- **🚥 Adaptive Signal Control (Green Wave)**: Dynamic Webster-based phase allocation to reduce wait times on high-density corridors like Wardha Road and Amravati Road.
- **🚨 Incident & Anomaly Detection**: Automated flagging of unexpected gridlocks, stalled vehicles, and route bottlenecks.
- **⚡ WebSocket Stream**: Low-latency push updates for live operational dashboards.

---

## 📄 Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [REST & WebSocket API Guide](docs/API.md)

---

## 📜 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
