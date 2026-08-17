import json
from typing import Any, Callable, Type
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from fastapi.encoders import jsonable_encoder

from app.schemas.base import BaseResponse, ErrorResponse

class StandardizedRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            try:
                # Call original handler
                response = await original_route_handler(request)
                
                # If it is a Response with body, decode and standardize
                if isinstance(response, Response) and hasattr(response, "body"):
                    try:
                        body_data = json.loads(response.body.decode("utf-8"))
                        # If already wrapped, return as is
                        if isinstance(body_data, dict) and "success" in body_data:
                            return response
                        wrapped = BaseResponse(success=True, data=body_data)
                        return JSONResponse(
                            status_code=response.status_code,
                            content=jsonable_encoder(wrapped)
                        )
                    except Exception:
                        return response

                if isinstance(response, BaseResponse):
                    return JSONResponse(content=jsonable_encoder(response))
                
                wrapped = BaseResponse(success=True, data=response)
                return JSONResponse(content=jsonable_encoder(wrapped))
                
            except Exception as exc:
                raise exc

        return custom_route_handler

def get_base_router(*args, **kwargs) -> APIRouter:
    """
    Factory for standardizing all routers to use the StandardizedRoute class
    which wraps all responses in BaseResponse.
    """
    kwargs.setdefault("route_class", StandardizedRoute)
    return APIRouter(*args, **kwargs)
