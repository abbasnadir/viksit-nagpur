"""Core configuration and environment settings."""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nagpur Traffic AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Coordinates: Nagpur Zero Mile Marker
    NAGPUR_CENTER_LAT: float = 21.1458
    NAGPUR_CENTER_LNG: float = 79.0882

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    # Paths
    DATA_GEOJSON_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../data/geojson")
    )
    MODEL_PATH: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../ml/models/traffic_predictor_latest.pkl")
    )

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
