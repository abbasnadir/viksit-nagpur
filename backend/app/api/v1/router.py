"""API v1 master router aggregating all sub-routers."""

from fastapi import APIRouter
from app.api.v1.endpoints import traffic, signals, predictions

api_router = APIRouter()

api_router.include_router(traffic.router)
api_router.include_router(signals.router)
api_router.include_router(predictions.router)
