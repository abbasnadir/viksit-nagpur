#!/usr/bin/env python3
"""
Seed demo historical traffic data and pre-train baseline ML models for Nagpur.
"""

import os
import sys

# Ensure root workspace is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.src.train_predictor import generate_synthetic_historical_data, train_model


def seed():
    print("🌱 Seeding Nagpur historical traffic dataset...")
    df = generate_synthetic_historical_data(n_days=14)
    
    processed_dir = os.path.join(os.path.dirname(__file__), "../data/processed")
    os.makedirs(processed_dir, exist_ok=True)
    
    out_csv = os.path.join(processed_dir, "historical_traffic_14d.csv")
    df.to_csv(out_csv, index=False)
    print(f"✓ Saved historical data ({len(df)} records) to {out_csv}")

    models_dir = os.path.join(os.path.dirname(__file__), "../ml/models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "traffic_predictor_latest.pkl")
    print(f"🤖 Training baseline predictor model -> {model_path}")
    train_model(data_path=out_csv, output_model_path=model_path)
    print("🎉 Seeding completed successfully!")


if __name__ == "__main__":
    seed()
