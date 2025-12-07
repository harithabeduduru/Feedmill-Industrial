# backend/app/data_loader.py
from pathlib import Path
from functools import lru_cache
import pandas as pd

# directory where your CSV bundle lives
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

TABLES = [
    "bagging",
    "batch_weighments",
    "batches",
    "downtime_events",
    "energy_meters_15min",
    "line_states_5min",
    "materials",
    "orders",
    "process_signals_5min",
    "products",
    "quality_results",
    "shipments",
    "silo_events",
    "silo_levels_15min",
]

# if some timestamp column name is different, map it here
TIMESTAMP_COLUMNS = {
    "bagging": "timestamp",
    "batch_weighments": "timestamp",
    "batches": "start_time",           # will also be copied to 'timestamp'
    "downtime_events": "timestamp",
    "energy_meters_15min": "timestamp",
    "line_states_5min": "timestamp",
    "orders": "order_date",
    "process_signals_5min": "timestamp",
    "products": None,
    "materials": None,
    "quality_results": "timestamp",
    "shipments": "timestamp",
    "silo_events": "timestamp",
    "silo_levels_15min": "timestamp",
}

@lru_cache
def load_all_sheets():
    """
    Load all CSVs into a dict of DataFrames, converting timestamp columns.
    Cached so we only read from disk once.
    """
    sheets = {}
    for name in TABLES:
        path = DATA_DIR / f"{name}.csv"
        df = pd.read_csv(path)

        ts_col = TIMESTAMP_COLUMNS.get(name)
        if ts_col and ts_col in df.columns:
            df[ts_col] = pd.to_datetime(df[ts_col])
            # many KPI helpers expect a generic 'timestamp' column
            if ts_col != "timestamp":
                df["timestamp"] = df[ts_col]

        sheets[name] = df

    return sheets
