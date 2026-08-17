"""Model Training Script for Nagpur Traffic AI Congestion Predictor."""

import argparse
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from ml.src.feature_engineering import prepare_features


def generate_synthetic_historical_data(n_days: int = 14) -> pd.DataFrame:
    """Generate realistic synthetic traffic data for Nagpur junctions for training baseline."""
    junctions = [
        "J_SITABULDI_VARIETY", "J_SAMVIDHAN_RBI", "J_LAW_COLLEGE",
        "J_SHANKAR_NAGAR", "J_RAHATE_COLONY", "J_AJNI_SQUARE",
        "J_CHHATRAPATI_SQ", "J_MEDICAL_SQUARE", "J_TEL_EXCHANGE"
    ]
    base_capacities = {
        "J_SITABULDI_VARIETY": 3200, "J_SAMVIDHAN_RBI": 4000, "J_LAW_COLLEGE": 2800,
        "J_SHANKAR_NAGAR": 2600, "J_RAHATE_COLONY": 3600, "J_AJNI_SQUARE": 3700,
        "J_CHHATRAPATI_SQ": 3900, "J_MEDICAL_SQUARE": 3000, "J_TEL_EXCHANGE": 3100
    }
    
    date_range = pd.date_range(end=pd.Timestamp.now(), periods=n_days * 24 * 4, freq="15min")
    records = []

    for dt in date_range:
        hour = dt.hour + dt.minute / 60.0
        # Morning peak (8:30 - 11:30 AM), Evening peak (5:00 - 8:30 PM)
        morning_factor = np.exp(-((hour - 10.0) ** 2) / 2.5) * 0.9
        evening_factor = np.exp(-((hour - 18.5) ** 2) / 3.0) * 1.0
        night_drop = 0.15 if (hour < 5 or hour > 23) else 0.45
        time_factor = max(night_drop, morning_factor + evening_factor + 0.3)

        for j_id in junctions:
            cap = base_capacities[j_id]
            noise = np.random.normal(0, 0.05)
            volume = int(cap * (time_factor + noise))
            avg_speed = max(10, int(55 * (1 - (volume / (cap * 1.2)))))
            
            records.append({
                "timestamp": dt,
                "junction_id": j_id,
                "volume_pcu": max(100, volume),
                "avg_speed_kmh": avg_speed
            })

    return pd.DataFrame(records)


def train_model(data_path: str = None, output_model_path: str = "ml/models/traffic_predictor_latest.pkl"):
    """Train Gradient Boosting model and save artifact."""
    if data_path and os.path.exists(data_path):
        print(f"Loading data from {data_path}")
        df = pd.read_csv(data_path)
    else:
        print("Generating synthetic historical dataset for training...")
        df = generate_synthetic_historical_data(n_days=21)

    print("Engineering features...")
    X, y = prepare_features(df, target_col="volume_pcu")

    # Time-based train-test split (80% train, 20% test)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    print(f"Training GradientBoostingRegressor on {len(X_train)} samples...")
    model = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    mape = np.mean(np.abs((y_test - preds) / y_test)) * 100

    print("=== Training Evaluation ===")
    print(f"MAE:  {mae:.2f} PCU/hr")
    print(f"RMSE: {rmse:.2f} PCU/hr")
    print(f"MAPE: {mape:.2f}%")
    print(f"R²:   {r2:.4f}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    payload = {
        "model": model,
        "feature_names": list(X.columns),
        "metrics": {"mae": mae, "rmse": rmse, "mape": mape, "r2": r2}
    }
    joblib.dump(payload, output_model_path)
    print(f"Model saved successfully to {output_model_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Traffic Congestion Predictor")
    parser.add_argument("--data", type=str, default=None, help="Path to input CSV")
    parser.add_argument("--out", type=str, default="ml/models/traffic_predictor_latest.pkl", help="Output model path")
    args = parser.parse_args()
    train_model(data_path=args.data, output_model_path=args.out)
