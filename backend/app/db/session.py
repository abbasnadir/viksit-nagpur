import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

logger = logging.getLogger("nagpur_traffic.db")

# Format database URL for async driver
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    async_db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    async_db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
else:
    async_db_url = db_url

# Fallback mechanism: if default neon template is present or in development without remote PG
if "ep-cool-darkness-123456" in async_db_url or settings.ENVIRONMENT == "development_sqlite":
    async_db_url = "sqlite+aiosqlite:///./nagpur_traffic.db"

try:
    engine = create_async_engine(
        async_db_url,
        echo=False,
        future=True,
        pool_pre_ping=True if not async_db_url.startswith("sqlite") else False
    )
except Exception as e:
    logger.warning(f"Failed to create primary engine with {async_db_url}, falling back to SQLite: {e}")
    async_db_url = "sqlite+aiosqlite:///./nagpur_traffic.db"
    engine = create_async_engine(async_db_url, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async DB session in route handlers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
