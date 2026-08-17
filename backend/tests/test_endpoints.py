import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.init_db import init_database

@pytest.fixture(scope="session", autouse=True)
def init_db():
    asyncio.run(init_database())

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_risk_heatmap():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/risk/heatmap")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert "points" in res["data"]
        assert len(res["data"]["points"]) >= 15

@pytest.mark.asyncio
async def test_risk_rankings():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/risk/rankings")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert len(res["data"]) >= 15
        assert res["data"][0]["riskScore"] >= res["data"][-1]["riskScore"]

@pytest.mark.asyncio
async def test_risk_location_details():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/risk/LOC_VARIETY")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert res["data"]["id"] == "LOC_VARIETY"
        assert "riskFactors" in res["data"]

@pytest.mark.asyncio
async def test_traffic_location():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/traffic/LOC_VARIETY")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert res["data"]["locationId"] == "LOC_VARIETY"

@pytest.mark.asyncio
async def test_incidents_list_and_report():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Get incidents
        response = await client.get("/api/v1/incidents")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert len(res["data"]) > 0

        # 2. Report new incident
        new_inc = {
            "incident_type": "Accident",
            "location": "Sitabuldi Variety Square",
            "description": "Two two-wheelers collided near the metro pillar.",
        }
        post_res = await client.post("/api/v1/incidents/report", json=new_inc)
        assert post_res.status_code == 200
        post_data = post_res.json()
        assert post_data["success"] is True
        assert "incident" in post_data["data"]

@pytest.mark.asyncio
async def test_officers_and_workload():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/officers")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True
        assert len(res["data"]) > 0

        workload_res = await client.get("/api/v1/officers/workload")
        assert workload_res.status_code == 200
        w_data = workload_res.json()
        assert w_data["success"] is True
        assert w_data["data"]["totalOfficers"] > 0

@pytest.mark.asyncio
async def test_deployments_and_recommendations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Get deployments
        response = await client.get("/api/v1/deployments")
        assert response.status_code == 200
        res = response.json()
        assert res["success"] is True

        # Recommend deployment
        rec_res = await client.post("/api/v1/deployments/recommend", json={
            "location_id": "LOC_CHHATRAPATI",
            "priority": "high"
        })
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert rec_data["success"] is True
        assert len(rec_data["data"]) > 0

@pytest.mark.asyncio
async def test_schedule_and_optimize():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        get_res = await client.get("/api/v1/schedule")
        assert get_res.status_code == 200

        opt_res = await client.post("/api/v1/schedule/optimize", json={
            "date": "2026-08-18"
        })
        assert opt_res.status_code == 200
        opt_data = opt_res.json()
        assert opt_data["success"] is True
        assert opt_data["data"]["totalOfficersScheduled"] > 0

@pytest.mark.asyncio
async def test_redeployment_simulation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        sim_res = await client.post("/api/v1/redeployment/simulate", json={
            "incident_id": "INC_001"
        })
        assert sim_res.status_code == 200
        sim_data = sim_res.json()
        assert sim_data["success"] is True
        assert "redeploymentPlan" in sim_data["data"]
        assert "comparisonMetrics" in sim_data["data"]
