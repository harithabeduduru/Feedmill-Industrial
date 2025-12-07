from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

# Helper: safe .sum()
def ssum(series):
    try:
        return series.sum()
    except Exception:
        return 0


def filter_time(df: pd.DataFrame, col: str, start=None, end=None) -> pd.DataFrame:
    """
    Safely filter a DataFrame by datetime range, even if the column is string.
    If the column doesn't exist, returns df unchanged.
    """
    if (start is None and end is None) or col not in df.columns:
        return df

    # Convert to datetime safely (invalid -> NaT)
    ts = pd.to_datetime(df[col], errors="coerce")

    mask = pd.Series(True, index=df.index)
    if start is not None:
        mask &= ts >= start
    if end is not None:
        mask &= ts <= end

    return df[mask]


def production_vs_plan(
    sheets: Dict[str, pd.DataFrame], start=None, end=None
) -> Dict[str, Any]:
    """
    Production: shipments.net_weight_t or batches.actual_mass_t
    Plan: orders.planned_tons (if exists)
    Returns totals and attainment %
    """
    shipments = sheets.get("shipments")
    batches = sheets.get("batches")
    orders = sheets.get("orders")

    produced = 0.0

    # --- Produced tons from shipments ---
    if shipments is not None and "net_weight_t" in shipments.columns:
        df = shipments.copy()
        # use generic 'timestamp' if present; otherwise don't time-filter
        if "timestamp" in df.columns:
            df = filter_time(df, "timestamp", start, end)
        produced = float(ssum(df["net_weight_t"].fillna(0)))

    # --- Or from batches if shipments not available ---
    elif batches is not None and "actual_mass_t" in batches.columns:
        df = batches.copy()

        # batches may have 'start_time' or 'timestamp' or no timestamp at all
        if "start_time" in df.columns:
            df = filter_time(df, "start_time", start, end)
        elif "timestamp" in df.columns:
            df = filter_time(df, "timestamp", start, end)

        produced = float(ssum(df["actual_mass_t"].fillna(0)))

    # --- Planned tons ---
    planned = 0.0
    if orders is not None:
        df_o = orders.copy()

        # try to time-filter using whichever date column exists
        for date_col in ["order_date", "timestamp", "start_time"]:
            if date_col in df_o.columns:
                df_o = filter_time(df_o, date_col, start, end)
                break

        if "planned_tons" in df_o.columns:
            planned = float(ssum(df_o["planned_tons"].fillna(0)))
        elif "planned_weight_t" in df_o.columns:
            planned = float(ssum(df_o["planned_weight_t"].fillna(0)))
        else:
            # fallback: assume plan = actual, so attainment = 100%
            planned = produced

    attainment = None
    if planned:
        attainment = produced / planned

    return {
        "produced_t": round(produced, 2),
        "planned_t": round(planned, 2),
        "attainment": round(attainment, 4) if attainment is not None else None,
    }


def sec_kwh_per_ton(
    sheets: Dict[str, pd.DataFrame],
    meter_id: str = "EM-MAIN",
    start=None,
    end=None,
) -> Dict[str, Any]:
    """
    SEC = SUM(kWh WHERE meter_id='EM-MAIN') / produced_tons
    Expects energy_meters_15min with columns: timestamp, meter_id, kwh
    """
    energy = sheets.get("energy_meters_15min")
    shipments = sheets.get("shipments")

    total_kwh = 0.0
    if energy is not None:
        df = energy.copy()
        if "timestamp" in df.columns:
            df = filter_time(df, "timestamp", start, end)
        if "meter_id" in df.columns:
            df = df[df["meter_id"] == meter_id]
        if "kwh" in df.columns:
            total_kwh = float(ssum(df["kwh"].fillna(0)))

    produced = 0.0
    if shipments is not None and "net_weight_t" in shipments.columns:
        df_s = shipments.copy()
        if "timestamp" in df_s.columns:
            df_s = filter_time(df_s, "timestamp", start, end)
        produced = float(ssum(df_s["net_weight_t"].fillna(0)))

    sec = None
    if produced:
        sec = total_kwh / produced

    return {
        "total_kwh": round(total_kwh, 2),
        "produced_t": round(produced, 2),
        "sec_kwh_t": sec if sec is not None else None,
    }


def steam_per_ton(
    sheets: Dict[str, pd.DataFrame],
    steam_signal_name: Optional[str] = None,
    start=None,
    end=None,
) -> Dict[str, Any]:
    """
    Steam per ton:
    integrate steam_flow_kgph over 5-min intervals => steam_mass_kg = steam_flow_kgph * (5/60)
    total_steam_kg / produced_tons = kg/ton
    """
    ps = sheets.get("process_signals_5min")
    shipments = sheets.get("shipments")

    total_steam_kg = 0.0
    if ps is not None:
        df = ps.copy()
        if "timestamp" in df.columns:
            df = filter_time(df, "timestamp", start, end)

        # Try to find steam flow column
        col_candidates = ["steam_flow_kgph", "steam_flow_kg_h", "steam_kgph", "steam_flow"]
        col = None
        if steam_signal_name and steam_signal_name in df.columns:
            col = steam_signal_name
        else:
            for c in col_candidates:
                if c in df.columns:
                    col = c
                    break

        if col is not None:
            total_steam_kg = float(ssum(df[col].fillna(0) * (5.0 / 60.0)))

    produced = 0.0
    if shipments is not None and "net_weight_t" in shipments.columns:
        df_s = shipments.copy()
        if "timestamp" in df_s.columns:
            df_s = filter_time(df_s, "timestamp", start, end)
        produced = float(ssum(df_s["net_weight_t"].fillna(0)))

    steam_kg_per_t = None
    if produced:
        steam_kg_per_t = total_steam_kg / produced

    return {
        "total_steam_kg": round(total_steam_kg, 2),
        "produced_t": round(produced, 2),
        "steam_kg_per_t": round(steam_kg_per_t, 2) if steam_kg_per_t is not None else None
    }



def availability_from_line_states(
    sheets: Dict[str, pd.DataFrame], start=None, end=None
) -> Dict[str, Any]:
    """
    Availability: RUN vs non-RUN from line_states_5min
    Expect line_states_5min: timestamp, line_id, state (RUN/STOP/MAINT etc)
    Compute RUN % per line
    """
    states = sheets.get("line_states_5min")
    if states is None:
        return {}

    df = states.copy()
    if "timestamp" in df.columns:
        df = filter_time(df, "timestamp", start, end)

    if "line_id" not in df.columns or "state" not in df.columns:
        return {}

    grouped = df.groupby("line_id").apply(
        lambda g: (g["state"] == "RUN").sum() / float(len(g)) if len(g) else np.nan
    )

    result = {}
    for line_id, val in grouped.items():
        result[str(line_id)] = {"run_fraction": round(float(val), 4) if not pd.isna(val) else None}
    return result


def fpy_from_quality(
    sheets: Dict[str, pd.DataFrame], start=None, end=None
) -> Dict[str, Any]:
    """
    FPY = #PASS / (#PASS + #HOLD)
    Expects quality_results with columns: timestamp, result (PASS/HOLD/FAIL)
    Return overall FPY and list of recent HOLD samples (drill-down)
    """
    qr = sheets.get("quality_results")
    if qr is None:
        return {"fpy": None, "hold_samples": []}

    df = qr.copy()
    if "timestamp" in df.columns:
        df = filter_time(df, "timestamp", start, end)

    if "result" not in df.columns:
        return {"fpy": None, "hold_samples": []}

    counts = df["result"].value_counts().to_dict()
    passes = counts.get("PASS", 0) or counts.get("Pass", 0) or counts.get("pass", 0)
    holds = counts.get("HOLD", 0) or counts.get("Hold", 0) or counts.get("hold", 0)
    total = float(passes + holds)

    fpy = None
    if total > 0:
        fpy = passes / total

    hold_samples = []
    if holds:
        hold_df = df[df["result"].str.upper() == "HOLD"]
        cols_we_want = [
            c
            for c in [
                "timestamp",
                "batch_id",
                "product",
                "note",
                "hold_note",
                "sample_id",
            ]
            if c in hold_df.columns
        ]
        hold_samples = (
            hold_df.sort_values("timestamp", ascending=False)
            .head(10)[cols_we_want]
            .to_dict(orient="records")
        )

    return {"fpy": round(fpy, 4) if fpy is not None else None, "hold_samples": hold_samples}


def silo_doc_and_events(
    sheets: Dict[str, pd.DataFrame], start=None, end=None
) -> Dict[str, Any]:
    """
    DOC = current silo level ÷ 7-day avg consumption (simplified)
    For now: return:
      - latest silo level row (wide format, *_level_t columns)
      - last LOW_LEVEL / CHANGEOVER events from silo_events
    """
    silo_levels = sheets.get("silo_levels_15min")
    silo_events = sheets.get("silo_events")

    res: Dict[str, Any] = {}

    # --- Latest levels (wide format: RM-CORN_level_t, RM-SOY_level_t, ...) ---
    if silo_levels is not None and not silo_levels.empty:
        df = silo_levels.copy()

        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
            df = df.sort_values("timestamp")

        # File is WIDE format (no silo_id), so just take latest row
        latest = df.tail(1).reset_index(drop=True)

        # Round ALL *_level_t columns to 2 decimals
        for col in latest.columns:
            if col.endswith("_level_t"):
                latest[col] = pd.to_numeric(latest[col], errors="coerce").round(2)

        res["silo_latest_levels"] = latest.to_dict(orient="records")
    else:
        res["silo_latest_levels"] = []

    # --- Events: LOW_LEVEL / CHANGEOVER (last 50) ---
    if silo_events is not None and not silo_events.empty:
        ev = silo_events.copy()

        if "timestamp" in ev.columns:
            ev["timestamp"] = pd.to_datetime(ev["timestamp"], errors="coerce")
            ev = ev.sort_values("timestamp")

            if start is not None:
                ev = ev[ev["timestamp"] >= start]
            if end is not None:
                ev = ev[ev["timestamp"] <= end]

        if "event_type" in ev.columns:
            mask = ev["event_type"].astype(str).str.upper().isin(["LOW_LEVEL", "CHANGEOVER"])
            events_filtered = (
                ev[mask]
                .sort_values("timestamp", ascending=False)
                .head(50)
            )
        else:
            events_filtered = ev.tail(50)

        res["silo_events"] = events_filtered.to_dict(orient="records")
    else:
        res["silo_events"] = []

    return res

