import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class LocationModel(Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    short_name: Mapped[str] = mapped_column(String(100), nullable=False)
    area: Mapped[str] = mapped_column(String(100), nullable=False)
    corridor: Mapped[str] = mapped_column(String(150), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    map_x: Mapped[float] = mapped_column(Float, default=0.0)
    map_y: Mapped[float] = mapped_column(Float, default=0.0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(20), default="Low")
    officers_assigned: Mapped[int] = mapped_column(Integer, default=0)
    recommended_officers: Mapped[int] = mapped_column(Integer, default=1)
    active_incidents: Mapped[int] = mapped_column(Integer, default=0)
    traffic_condition: Mapped[str] = mapped_column(String(50), default="Normal")
    risk_factors: Mapped[list] = mapped_column(JSON, default=list)
    avg_speed_kmh: Mapped[float] = mapped_column(Float, default=30.0)
    volume_pcu_hr: Mapped[float] = mapped_column(Float, default=2000.0)
    queue_length_m: Mapped[float] = mapped_column(Float, default=15.0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "shortName": self.short_name,
            "area": self.area,
            "corridor": self.corridor,
            "lat": self.lat,
            "lng": self.lng,
            "mapX": self.map_x,
            "mapY": self.map_y,
            "riskScore": round(self.risk_score, 1),
            "riskLevel": self.risk_level,
            "officersAssigned": self.officers_assigned,
            "recommendedOfficers": self.recommended_officers,
            "activeIncidents": self.active_incidents,
            "trafficCondition": self.traffic_condition,
            "riskFactors": self.risk_factors if isinstance(self.risk_factors, list) else [],
            "avgSpeedKmh": self.avg_speed_kmh,
            "volumePcuHr": self.volume_pcu_hr,
            "queueLengthM": self.queue_length_m,
        }


class OfficerModel(Base):
    __tablename__ = "officers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    badge_no: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rank: Mapped[str] = mapped_column(String(50), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    location_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    location_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    availability: Mapped[str] = mapped_column(String(30), default="Available")
    shift: Mapped[str] = mapped_column(String(50), default="06:00–14:00")
    hours_on_duty: Mapped[float] = mapped_column(Float, default=0.0)
    workload_pct: Mapped[float] = mapped_column(Float, default=0.0)
    phone: Mapped[str] = mapped_column(String(20), default="9876543210")

    def to_dict(self):
        return {
            "id": self.id,
            "badgeNo": self.badge_no,
            "name": self.name,
            "rank": self.rank,
            "zone": self.zone,
            "locationId": self.location_id,
            "locationName": self.location_name,
            "availability": self.availability,
            "shift": self.shift,
            "hoursOnDuty": self.hours_on_duty,
            "workloadPct": round(self.workload_pct, 1),
            "phone": self.phone,
        }


class IncidentModel(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    location_id: Mapped[str] = mapped_column(String(50), nullable=False)
    location_name: Mapped[str] = mapped_column(String(150), nullable=False)
    severity: Mapped[str] = mapped_column(String(30), default="Moderate")
    short_description: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reported_at: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Active")
    officer_assigned: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    estimated_clearance_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source: Mapped[str] = mapped_column(String(30), default="police")

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "locationId": self.location_id,
            "locationName": self.location_name,
            "severity": self.severity,
            "shortDescription": self.short_description or self.description[:50],
            "description": self.description,
            "reportedAt": self.reported_at,
            "status": self.status,
            "officerAssigned": self.officer_assigned,
            "estimatedClearanceMin": self.estimated_clearance_min,
            "photoUrl": self.photo_url,
            "source": self.source,
        }


class DeploymentModel(Base):
    __tablename__ = "deployments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    officer_id: Mapped[str] = mapped_column(String(50), nullable=False)
    officer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    officer_badge: Mapped[str] = mapped_column(String(50), nullable=False)
    from_location_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    from_location_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    to_location_id: Mapped[str] = mapped_column(String(50), nullable=False)
    to_location_name: Mapped[str] = mapped_column(String(150), nullable=False)
    priority: Mapped[str] = mapped_column(String(30), default="High")
    eta_minutes: Mapped[int] = mapped_column(Integer, default=10)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Pending")
    is_ai: Mapped[bool] = mapped_column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "officerId": self.officer_id,
            "officerName": self.officer_name,
            "officerBadge": self.officer_badge,
            "fromLocationId": self.from_location_id,
            "fromLocationName": self.from_location_name or "Reserve (Unassigned)",
            "toLocationId": self.to_location_id,
            "toLocationName": self.to_location_name,
            "priority": self.priority,
            "etaMinutes": self.eta_minutes,
            "reason": self.reason,
            "status": self.status,
            "isAI": self.is_ai,
        }


class ScheduleModel(Base):
    __tablename__ = "schedules"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    officer_id: Mapped[str] = mapped_column(String(50), nullable=False)
    officer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    shift_date: Mapped[str] = mapped_column(String(30), nullable=False)
    shift_time: Mapped[str] = mapped_column(String(50), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    assigned_location_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Scheduled")

    def to_dict(self):
        return {
            "id": self.id,
            "officerId": self.officer_id,
            "officerName": self.officer_name,
            "shiftDate": self.shift_date,
            "shiftTime": self.shift_time,
            "zone": self.zone,
            "assignedLocationId": self.assigned_location_id,
            "status": self.status,
        }
