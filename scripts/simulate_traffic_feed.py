#!/usr/bin/env python3
"""
Simulate live real-time traffic sensor ticks for Nagpur junctions.
Streams continuous flow data, vehicle classification counts, and speeds.
"""

import argparse
import json
import os
import random
import sys
import time
from datetime import datetime, timezone
import requests

DEFAULT_JUNCTIONS_FILE = os.path.join(os.path.dirname(__file__), "../data/geojson/nagpur_junctions.geojson")


def load_junctions(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: Junctions file not found at {file_path}")
        sys.exit(1)
    with open(file_path, "r") as f:
        data = json.load(f)
    return data.get("features", [])


def generate_tick_payload(junction_feature):
    props = junction_feature["properties"]
    j_id = props["id"]
    cap = props.get("capacity_pcu_hr", 4000)

    # Current time factor
    now = datetime.now(timezone.utc)
    hour = now.hour + now.minute / 60.0
    
    # Peak hours around 9-11 AM and 5-8 PM IST (approx +5.5h)
    ist_hour = (hour + 5.5) % 24
    morning_peak = max(0.0, 1.0 - abs(ist_hour - 10.0) / 2.5)
    evening_peak = max(0.0, 1.0 - abs(ist_hour - 18.5) / 3.0)
    density_factor = max(0.2, (morning_peak * 0.9 + evening_peak * 1.0 + random.uniform(0.2, 0.4)))
    density_factor = min(1.2, density_factor)

    volume_pcu = int(cap * density_factor)
    avg_speed = max(8.0, round(55.0 * (1.0 - min(0.9, volume_pcu / (cap * 1.3))), 1))
    queue_meters = max(0.0, round((volume_pcu / cap) * 80.0 + random.uniform(-5, 10), 1))

    # Vehicle distribution (Typical Indian city composition: high 2-wheelers & autos)
    total_vehicles = int(volume_pcu * 0.75)
    two_wheelers = int(total_vehicles * random.uniform(0.55, 0.65))
    cars = int(total_vehicles * random.uniform(0.20, 0.28))
    autos = int(total_vehicles * random.uniform(0.10, 0.15))
    buses = max(1, int(total_vehicles * random.uniform(0.01, 0.03)))
    trucks = max(0, int(total_vehicles * random.uniform(0.005, 0.02)))

    congestion = "normal"
    if volume_pcu > cap * 0.85:
        congestion = "severe" if volume_pcu > cap * 1.05 else "heavy"
    elif volume_pcu > cap * 0.60:
        congestion = "moderate"

    return {
        "junction_id": j_id,
        "junction_name": props["name"],
        "timestamp": now.isoformat(),
        "volume_pcu_hr": volume_pcu,
        "avg_speed_kmh": avg_speed,
        "queue_length_meters": queue_meters,
        "congestion_level": congestion,
        "vehicle_counts": {
            "two_wheeler": two_wheelers,
            "car": cars,
            "auto_rickshaw": autos,
            "bus": buses,
            "truck": trucks
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Simulate Nagpur real-time traffic feed")
    parser.add_argument("--api", type=str, default="http://localhost:8000/api/v1/traffic/record", help="Backend ingestion endpoint")
    parser.add_argument("--interval", type=float, default=3.0, help="Interval in seconds between ticks")
    parser.add_argument("--dry-run", action="store_true", help="Print ticks locally without posting to API")
    parser.add_argument("--count", type=int, default=0, help="Number of ticks to emit (0 for infinite)")
    args = parser.parse_args()

    junctions = load_junctions(DEFAULT_JUNCTIONS_FILE)
    print(f"🚦 Starting traffic simulation across {len(junctions)} Nagpur junctions...")
    print(f"Target: {'[DRY RUN - STDOUT]' if args.dry_run else args.api}")

    iteration = 0
    try:
        while True:
            iteration += 1
            print(f"\n--- Simulation Cycle #{iteration} [{datetime.now().strftime('%H:%M:%S')}] ---")
            for junction in junctions:
                payload = generate_tick_payload(junction)
                if args.dry_run:
                    print(f"[{payload['junction_id']}] {payload['junction_name']}: {payload['volume_pcu_hr']} PCU/hr | {payload['avg_speed_kmh']} km/h | {payload['congestion_level'].upper()}")
                else:
                    try:
                        resp = requests.post(args.api, json=payload, timeout=2.0)
                        if resp.status_code == 200:
                            print(f"✓ Posted {payload['junction_id']} -> OK")
                        else:
                            print(f"✗ Failed {payload['junction_id']}: HTTP {resp.status_code}")
                    except Exception as e:
                        print(f"⚠️ Connection error posting to {args.api}: {e}")

            if args.count > 0 and iteration >= args.count:
                print(f"\nCompleted {iteration} simulation cycles.")
                break

            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n🛑 Simulation stopped by user.")


if __name__ == "__main__":
    main()
