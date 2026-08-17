from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.schemas.base import ErrorResponse

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    details = [{"location": " -> ".join(str(l) for l in err.get("loc", [])), "message": err.get("msg", ""), "type": err.get("type")} for err in errors]
        
    error_response = ErrorResponse(
        success=False,
        message="Data validation failed",
        error_code="VALIDATION_ERROR",
        details=details
    )
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=error_response.model_dump())

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    error_response = ErrorResponse(
        success=False,
        message=str(exc.detail),
        error_code=f"HTTP_{exc.status_code}_ERROR"
    )
    return JSONResponse(status_code=exc.status_code, content=error_response.model_dump())

async def global_exception_handler(request: Request, exc: Exception):
    error_response = ErrorResponse(
        success=False,
        message="An unexpected server error occurred",
        error_code="INTERNAL_SERVER_ERROR",
        details=str(exc)
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=error_response.model_dump())
