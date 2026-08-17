from typing import Any, Callable
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from fastapi.params import Depends as DependsClass

from app.schemas.base import BaseResponse
from app.api.dependencies import get_current_user

class StandardizedRoute(APIRoute):
    def __init__(self, *args, **kwargs):
        openapi_extra = kwargs.get("openapi_extra", {})
        is_public = openapi_extra.get("is_public", False) if openapi_extra else False
        
        if not is_public:
            dependencies = kwargs.get("dependencies", []) or []
            if not any(isinstance(dep, DependsClass) and dep.dependency == get_current_user for dep in dependencies):
                dependencies.append(Depends(get_current_user))
            kwargs["dependencies"] = dependencies
            
        super().__init__(*args, **kwargs)

    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Any:
            response = await original_route_handler(request)
            if isinstance(response, BaseResponse) or isinstance(response, JSONResponse):
                return response
            return BaseResponse(success=True, data=response)

        return custom_route_handler

def get_base_router(*args, **kwargs) -> APIRouter:
    kwargs.setdefault("route_class", StandardizedRoute)
    return APIRouter(*args, **kwargs)

api_router = APIRouter()

# Unimplemented routes have been removed. Ready for new implementations.
