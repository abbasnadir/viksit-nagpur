# Nagpur Traffic AI - Backend Architecture

## Overview
The backend serves as the single source of truth for the Nagpur Traffic Risk Prediction & Police Deployment Decision Support System. It is built using FastAPI and enforces a standard architecture for routing, request sanitization, authentication, and responses.

## Key Architectural Decisions

### Single Source of Truth
The backend handles all business logic, AI/ML model integration (XGBoost, OR-Tools), external API communications (Google Maps, WhatsApp), and data processing. The frontend is strictly a presentation layer.

### Standardized Routing Template
All API endpoints use a centralized `BaseResponse` model enforced through a custom `APIRouter` wrapper (`StandardizedRoute`). This ensures every response follows this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "meta": null
}
```

### Input Sanitization & Validation
Every incoming request must be validated using Pydantic models defined in `app/schemas/requests.py`. This provides robust input sanitization, type checking, and length validation before hitting the core logic.

### Rate Limiting
API rate limiting is implemented globally using `slowapi`. This protects against abuse and ensures system reliability, especially for public-facing endpoints like incident reporting.

### Authentication
JWT-based authentication is implemented for all secure routes. The `app/core/security.py` module manages token creation, validation, and password hashing using `passlib` and `python-jose`.

### API Structure
- **`/risk`**: Traffic risk calculations, heatmaps, and ranking.
- **`/traffic`**: Live traffic telemetry and history.
- **`/incidents`**: Public and internal incident reporting.
- **`/officers`**: Officer management and workload tracking.
- **`/deployments`**: AI-recommended officer deployments, approvals, and overrides.
- **`/schedule`**: Officer shift optimization using Google OR-Tools.
- **`/redeployment`**: Dynamic accident response simulations.

## Backend Setup Guide

Follow these steps to set up the Nagpur Traffic AI backend environment.

### Prerequisites
- Python 3.11+
- PostgreSQL + PostGIS (for geospatial data) or Neon DB
- `uv` (Fast python package installer)

### 1. Environment Setup

If using the automated `run.sh` script from the project root:
```bash
../run.sh backend
```
This handles `uv` installation, `.venv` creation, dependency installation, and server startup automatically.

### Manual Setup
Clone the repository and navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
uv venv .venv --python 3.11
source .venv/bin/activate
```

### 2. Install Dependencies

Install all required Python packages:
```bash
uv pip install -r requirements.txt
```

### 3. Configuration

Copy the example environment file and configure your local settings:
```bash
cp .env.example .env
```
Ensure you have the following keys properly set in your `.env`:
- `SECRET_KEY` (for JWT tokens)
- `DATABASE_URL` (Neon Postgres URL)

### 4. Running the Server

Start the FastAPI development server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Documentation

Once the server is running, you can access the automatically generated interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
