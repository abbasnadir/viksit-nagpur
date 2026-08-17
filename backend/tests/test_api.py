"""Unit and integration tests for Nagpur Traffic AI Backend APIs."""

import pytest
from app.optimization.signal_optimizer import WebsterSignalOptimizer, GreenWaveCoordinator


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "active_junctions_count" in data


def test_traffic_overview(client):
    response = client.get("/api/v1/traffic/overview")
    assert response.status_code == 200
    data = response.json()
    assert "city_average_speed_kmh" in data
    assert "overall_congestion_index" in data
    assert data["total_monitored_junctions"] >= 0


def test_list_junctions(client):
    response = client.get("/api/v1/traffic/junctions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        j = data[0]
        assert "id" in j
        assert "name" in j
        assert "current_volume_pcu_hr" in j


def test_record_telemetry(client):
    payload = {
        "junction_id": "J_SITABULDI_VARIETY",
        "volume_pcu_hr": 2850,
        "avg_speed_kmh": 26.5,
        "queue_length_meters": 35.0,
        "vehicle_counts": {
            "two_wheeler": 140,
            "car": 60,
            "auto_rickshaw": 30,
            "bus": 5,
            "truck": 2
        }
    }
    response = client.post("/api/v1/traffic/record", json=payload)
    # If junction loaded, it returns 200, else 404
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert data["current_volume_pcu_hr"] == 2850
        assert data["avg_speed_kmh"] == 26.5


def test_signal_optimization_endpoint(client):
    response = client.get("/api/v1/signals/plans/J_SITABULDI_VARIETY")
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert "optimal_cycle_length_sec" in data
        assert len(data["phases"]) == 2
        assert data["optimal_cycle_length_sec"] >= 45


def test_green_wave_endpoint(client):
    response = client.get("/api/v1/signals/green-wave/corridors?corridor=CORRIDOR_WARDHA_RD")
    assert response.status_code == 200
    data = response.json()
    assert "coordination_offsets" in data
    assert len(data["coordination_offsets"]) > 0


def test_webster_optimizer_unit():
    plan = WebsterSignalOptimizer.optimize_junction(
        junction_id="TEST_JUNC",
        volume_pcu_hr=3200,
        lanes=4
    )
    assert plan.optimal_cycle_length_sec >= 45
    assert plan.optimal_cycle_length_sec <= 150
    total_green = sum(p.green_time_sec for p in plan.phases)
    assert total_green < plan.optimal_cycle_length_sec


def test_green_wave_unit():
    offsets = GreenWaveCoordinator.calculate_offsets(
        corridor_name="Test Corridor",
        junction_distances_meters=[1000.0, 1500.0],
        design_speed_kmh=45.0,
        common_cycle_sec=90
    )
    assert len(offsets) == 2
    assert offsets[0]["recommended_offset_sec"] >= 0
