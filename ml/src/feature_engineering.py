"""Feature Engineering Pipeline for Nagpur Traffic Prediction."""

import math
import numpy as np
import pandas as pd
from typing import List, Tuple


def create_time_features(df: pd.DataFrame, time_col: str = "timestamp") -> pd.DataFrame:
    """Extract cyclical and categorical time-based features from timestamp."""
    df = df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df[time_col]):
        df[time_col] = pd.to_datetime(df[time_col])

    df["hour"] = df[time_col].dt.hour
    df["minute"] = df[time_col].dt.minute
    df["dayofweek"] = df[time_col].dt.dayofweek
    df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

    # Cyclical hour encoding
    time_of_day_hours = df["hour"] + df["minute"] / 60.0
    df["hour_sin"] = np.sin(2 * np.pi * time_of_day_hours / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * time_of_day_hours / 24.0)

    # Cyclical day of week encoding
    df["day_sin"] = np.sin(2 * np.pi * df["dayofweek"] / 7.0)
    df["day_cos"] = np.cos(2 * np.pi * df["dayofweek"] / 7.0)

    # Nagpur specific peak hour indicator (9-11 AM, 5-8 PM)
    df["is_peak_hour"] = df["hour"].apply(lambda h: 1 if (9 <= h <= 11 or 17 <= h <= 20) else 0)

    return df


def create_lag_features(
    df: pd.DataFrame,
    group_col: str = "junction_id",
    target_col: str = "volume_pcu",
    lags: List[int] = [1, 2, 3, 4],
    rolling_windows: List[int] = [3, 6],
) -> pd.DataFrame:
    """Generate time-lagged and rolling statistical features per junction."""
    df = df.sort_values(by=[group_col, "timestamp"]).copy()

    for lag in lags:
        df[f"{target_col}_lag_{lag}"] = df.groupby(group_col)[target_col].shift(lag)

    for window in rolling_windows:
        df[f"{target_col}_roll_mean_{window}"] = (
            df.groupby(group_col)[target_col]
            .shift(1)
            .rolling(window=window)
            .mean()
        )
        df[f"{target_col}_roll_std_{window}"] = (
            df.groupby(group_col)[target_col]
            .shift(1)
            .rolling(window=window)
            .std()
            .fillna(0)
        )

    return df


def prepare_features(df: pd.DataFrame, target_col: str = "volume_pcu") -> Tuple[pd.DataFrame, pd.Series]:
    """End-to-end feature pipeline returning (X, y)."""
    df_feat = create_time_features(df)
    df_feat = create_lag_features(df_feat, target_col=target_col)
    
    # Drop rows with NaN resulting from lagging
    df_feat = df_feat.dropna().reset_index(drop=True)

    feature_cols = [
        "hour_sin", "hour_cos", "day_sin", "day_cos", "is_weekend", "is_peak_hour",
        f"{target_col}_lag_1", f"{target_col}_lag_2", f"{target_col}_lag_3",
        f"{target_col}_roll_mean_3", f"{target_col}_roll_mean_6", f"{target_col}_roll_std_3"
    ]
    
    # One-hot encode junction_id if present
    if "junction_id" in df_feat.columns:
        junction_dummies = pd.get_dummies(df_feat["junction_id"], prefix="junc", drop_first=False)
        X = pd.concat([df_feat[feature_cols], junction_dummies], axis=1)
    else:
        X = df_feat[feature_cols]

    y = df_feat[target_col]
    return X, y
