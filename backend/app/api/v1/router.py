from app.api.v1.base_router import get_base_router
from app.api.v1.endpoints import (
    risk,
    traffic,
    incidents,
    officers,
    deployments,
    schedule,
    redeployment
)

api_router = get_base_router()

api_router.include_router(risk.router)
api_router.include_router(traffic.router)
api_router.include_router(incidents.router)
api_router.include_router(officers.router)
api_router.include_router(deployments.router)
api_router.include_router(schedule.router)
api_router.include_router(redeployment.router)
