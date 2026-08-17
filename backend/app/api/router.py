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



def get_base_router(*args, **kwargs) -> APIRouter:
    kwargs.setdefault("route_class", StandardizedRoute)
    return APIRouter(*args, **kwargs)

api_router = APIRouter()

from app.api.endpoints import traffic
api_router.include_router(traffic.router)

