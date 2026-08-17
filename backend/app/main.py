"""Main entry point for Nagpur Traffic AI FastAPI Backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.api.deps import limiter

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Traffic Risk Prediction & Police Deployment Decision Support System.",
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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)

from app.db.init_db import init_database

@app.on_event("startup")
async def on_startup():
    """Initialize database tables and seed sample Nagpur data if needed."""
    try:
        await init_database()
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").error(f"Error during startup DB initialization: {e}")

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for container probes."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
