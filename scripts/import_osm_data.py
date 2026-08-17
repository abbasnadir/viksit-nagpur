#!/usr/bin/env python3
"""
Utility to query OpenStreetMap Overpass API for Nagpur road network & intersections.
"""

import argparse
import json
import os
import requests

NAGPUR_BBOX = "21.05,79.00,21.25,79.20"  # south, west, north, east


def fetch_osm_junctions(bbox: str = NAGPUR_BBOX, output_path: str = None):
    """Fetch highway traffic signals and intersections in Nagpur from Overpass API."""
    query = f"""
    [out:json][timeout:30];
    (
      node["highway"="traffic_signals"]({bbox});
      node["highway"="motorway_junction"]({bbox});
    );
    out body;
    >;
    out skel qt;
    """
    url = "https://overpass-api.de/api/interpreter"
    print(f"📡 Querying OSM Overpass API for bounding box {bbox}...")
    
    try:
        response = requests.post(url, data={"data": query}, timeout=35)
        response.raise_for_status()
        data = response.json()
        elements = data.get("elements", [])
        print(f"✓ Retrieved {len(elements)} signal/junction nodes from OSM.")

        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w") as f:
                json.dump(data, f, indent=2)
            print(f"Saved OSM data to {output_path}")

        return data
    except Exception as e:
        print(f"⚠️ OSM Overpass query failed or timed out: {e}")
        return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract Nagpur OSM Highway & Traffic Signal Data")
    parser.add_argument("--out", type=str, default="data/raw/osm_nagpur_signals.json", help="Output file path")
    args = parser.parse_args()
    fetch_osm_junctions(output_path=args.out)
