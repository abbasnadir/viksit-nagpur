from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class IncidentReportRequest(BaseModel):
    incident_type: str = Field(..., min_length=2, max_length=50, description="Type of incident (e.g. accident, blockage)")
    location: str = Field(..., min_length=5, max_length=150, description="Address or coordinates")
    description: str = Field(..., min_length=10, max_length=500, description="Detailed description")
    photo_url: Optional[HttpUrl] = None

class DeploymentRecommendRequest(BaseModel):
    location_id: str = Field(..., min_length=1)
    priority: str = Field(..., pattern="^(low|medium|high)$")

class DeploymentApproveRequest(BaseModel):
    deployment_id: str = Field(..., min_length=1)
    officer_id: str = Field(..., min_length=1)

class DeploymentOverrideRequest(BaseModel):
    deployment_id: str = Field(..., min_length=1)
    new_officer_id: str = Field(..., min_length=1)
    reason: str = Field(..., min_length=5)

class ScheduleOptimizeRequest(BaseModel):
    date: str = Field(..., description="Date for scheduling YYYY-MM-DD")
    constraints: Optional[Dict[str, Any]] = None

class RedeploymentSimulateRequest(BaseModel):
    incident_id: str = Field(..., min_length=1)
