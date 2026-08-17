"""Core configuration and environment settings."""

from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Core API Settings
    PROJECT_NAME: str = "Nagpur Traffic AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "your_super_secret_jwt_key_here_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database
    DATABASE_URL: str = "postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
