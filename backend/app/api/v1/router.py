from fastapi import APIRouter
from app.api.v1.endpoints import (
    risk,
    traffic,
    incidents,
    officers,
    deployments,
    schedule,
    redeployment
)

api_router = APIRouter()

api_router.include_router(risk.router)
api_router.include_router(traffic.router)
api_router.include_router(incidents.router)
api_router.include_router(officers.router)
api_router.include_router(deployments.router)
api_router.include_router(schedule.router)
api_router.include_router(redeployment.router)
