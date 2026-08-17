"""Evaluation & Benchmarking Utilities for Nagpur Traffic Models."""

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def evaluate_model(model_path: str, test_df: pd.DataFrame, target_col: str = "volume_pcu"):
    """Evaluate saved model artifact against test dataset."""
    artifact = joblib.load(model_path)
    model = artifact["model"]
    feature_names = artifact["feature_names"]

    # Filter features
    X_test = test_df[feature_names]
    y_test = test_df[target_col]

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mape = np.mean(np.abs((y_test - preds) / y_test)) * 100
    r2 = r2_score(y_test, preds)

    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "mape": float(mape),
        "r2": float(r2)
    }
