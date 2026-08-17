from typing import Any, Callable, Type
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute

from app.schemas.base import BaseResponse, ErrorResponse

class StandardizedRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Any:
            try:
                # Call original handler
                response = await original_route_handler(request)
                
                # If it's already a standard response or direct Response object, return it
                if isinstance(response, BaseResponse):
                    return response
                if isinstance(response, JSONResponse):
                    return response
                
                # Wrap the response
                return BaseResponse(success=True, data=response)
                
            except Exception as exc:
                import traceback
                traceback.print_exc()
                # Generic fallback for unhandled exceptions. Handled exceptions should be raised as HTTPException
                raise exc

        return custom_route_handler

def get_base_router(*args, **kwargs) -> APIRouter:
    """
    Factory for standardizing all routers to use the StandardizedRoute class
    which wraps all responses in BaseResponse.
    """
    kwargs.setdefault("route_class", StandardizedRoute)
    return APIRouter(*args, **kwargs)
