# backend/app/api.py
from fastapi import APIRouter, Query
from datetime import datetime, timedelta

from .data_loader import load_all_sheets
from .kpi import (
    production_vs_plan,
    sec_kwh_per_ton,
    fpy_from_quality,
    silo_doc_and_events,
    availability_from_line_states,
    steam_per_ton,
)

router = APIRouter()


def get_period_range(period: str) -> tuple[datetime | None, datetime | None]:
    """
    Convert 'Today' / 'Yesterday' / 'WTD' / 'MTD' into (start, end) datetimes.
    If period is unknown, returns (None, None) meaning 'no filter'.
    """
    now = datetime.utcnow()
    now = now.replace(microsecond=0)

    if period == "Today":
        start = now.replace(hour=0, minute=0, second=0)
        end = now
    elif period == "Yesterday":
        end = now.replace(hour=0, minute=0, second=0)
        start = end - timedelta(days=1)
    elif period == "WTD":
        # Monday as start-of-week
        start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0
        )
        end = now
    elif period == "MTD":
        start = now.replace(day=1, hour=0, minute=0, second=0)
        end = now
    else:
        # no filter
        return None, None

    return start, end


# --- KPI endpoints -------------------------------------------------------


@router.get("/kpi/production")
def get_production(
    period: str = Query("WTD", pattern="^(Today|Yesterday|WTD|MTD)$"),
):
    sheets = load_all_sheets()
    start, end = get_period_range(period)
    return production_vs_plan(sheets, start=start, end=end)


@router.get("/kpi/energy/sec")
def get_sec(
    period: str = Query("WTD", pattern="^(Today|Yesterday|WTD|MTD)$"),
    meter_id: str = "EM-MAIN",
):
    sheets = load_all_sheets()
    start, end = get_period_range(period)
    return sec_kwh_per_ton(sheets, meter_id=meter_id, start=start, end=end)


@router.get("/kpi/fpy")
def get_fpy(
    period: str = Query("WTD", pattern="^(Today|Yesterday|WTD|MTD)$"),
):
    sheets = load_all_sheets()
    start, end = get_period_range(period)
    return fpy_from_quality(sheets, start=start, end=end)


@router.get("/kpi/silos")
def get_silos(
    period: str = Query("WTD", pattern="^(Today|Yesterday|WTD|MTD)$"),
):
    sheets = load_all_sheets()
    start, end = get_period_range(period)
    return silo_doc_and_events(sheets, start=start, end=end)


# Optional extra endpoints (nice for assignment completeness)

@router.get("/kpi/availability")
def get_availability(
    period: str = Query("WTD", pattern="^(Today|Yesterday|WTD|MTD)$"),
):
    sheets = load_all_sheets()
    start, end = get_period_range(period)
    return availability_from_line_states(sheets, start=start, end=end)


@router.get("/kpi/steam-per-ton")
def get_steam_per_ton(
    period: str = Query("WTD", pattern="^(Today|Yesterday|WTD|MTD)$"),
):
    sheets = load_all_sheets()
    start, end = get_period_range(period)
    return steam_per_ton(sheets, start=start, end=end)
