from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=settings.AUTH_URL if settings.AUTH_URL else "/api/v1/auth/login")
limiter = Limiter(key_func=get_remote_address)

class TokenPayload(BaseModel):
    sub: str = None

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = verify_token(token)
        token_data = TokenPayload(**payload)
        if token_data.sub is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data.sub
