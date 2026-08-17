"""Main entry point for Nagpur Traffic AI FastAPI Backend."""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.services.traffic_service import traffic_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart Urban Traffic Monitoring, Congestion Forecasting, and Adaptive Signal Optimization for Nagpur, India.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.ENVIRONMENT != "development" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for container probes."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "active_junctions_count": len(traffic_service.junctions)
    }


@app.websocket("/api/v1/ws/traffic")
async def websocket_traffic_stream(websocket: WebSocket):
    """WebSocket stream emitting real-time junction telemetry updates."""
    await traffic_service.connect_ws(websocket)
    try:
        # Send initial snapshot of all junctions upon connection
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "junctions": [j.model_dump(mode="json") for j in traffic_service.get_all_junctions()],
            "kpis": traffic_service.get_city_kpis().model_dump(mode="json")
        })
        while True:
            # Keep connection alive and listen for any client messages
            data = await websocket.receive_text()
            # Echo ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        traffic_service.disconnect_ws(websocket)
    except Exception:
        traffic_service.disconnect_ws(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
