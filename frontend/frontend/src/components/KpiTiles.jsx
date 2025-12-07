// src/components/KpiTiles.jsx
import React from "react";
import { fmt, fmtDecimal, fmtPercent } from "../utils/format";

export default function KpiTiles({
  production,
  sec,
  fpy,
  silos,
  availability,
  steam,
  loading,
  onFpyClick,
  onSiloClick,
}) {
  // --- Production ---
  const produced = production?.produced_t ?? null;
  const planned = production?.planned_t ?? null;
  const attainment =
    production?.attainment != null
      ? (production.attainment * 100).toFixed(1)
      : null;

  // --- FPY ---
  const fpyPct = fpy?.fpy != null ? (fpy.fpy * 100).toFixed(1) : null;
  const holdsCount = fpy?.hold_samples?.length ?? 0;

  // --- SEC / Energy ---
  const totalKwh = sec?.total_kwh ?? null;
  const secVal = sec?.sec_kwh_t != null ? sec.sec_kwh_t.toFixed(2) : null;

  // --- Availability (average) ---
  let availabilityPct = null;
  let runStatus = [];
  if (availability && Object.keys(availability).length) {
    const vals = Object.values(availability)
      .map((v) => v?.run_fraction)
      .filter((v) => v != null);

    if (vals.length) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      availabilityPct = (avg * 100).toFixed(1);
    }

    runStatus = Object.entries(availability).map(([line, v]) => ({
      line,
      pct: v?.run_fraction != null ? Math.round(v.run_fraction * 100) : 0,
    }));
  }

  // --- Silo coverage ---
  const siloHasData = !!silos?.silo_latest_levels?.length;

  // --- Steam per ton ---
  const steamPerTon =
    steam?.steam_kg_per_t != null ? steam.steam_kg_per_t.toFixed(1) : null;
  const steamTotal =
    steam?.total_steam_kg != null ? steam.total_steam_kg.toFixed(1) : null;

  return (
    <div className="kpi-tiles-vertical">
      {/* Production Rate */}
      <div className="kpi-card-right">
        <h4>Production Rate</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">
            {produced != null ? `${produced} t` : "—"}
          </span>
          <span className="kpi-main-sub">
            Target: {planned != null ? `${planned} t` : "—"}
          </span>
        </div>
        <div className="kpi-sub-line">
          Plan Attainment: {attainment != null ? `${attainment}%` : "—"}
        </div>
      </div>

      {/* Availability */}
      <div className="kpi-card-right">
        <h4>Plant Availability</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">
            {availabilityPct != null ? `${availabilityPct}%` : "—"}
          </span>
          <span className="kpi-main-sub">Operating Time</span>
        </div>
      </div>

      {/* Energy usage / SEC */}
      <div className="kpi-card-right">
        <h4>Plant Energy Usage</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">
            {totalKwh != null ? `${totalKwh} kWh` : "0 kWh"}
          </span>
          <span className="kpi-main-sub">
            SEC: {secVal != null ? `${secVal} kWh/t` : "0.00 kWh/t"}
          </span>
        </div>
        {/* simple sparkline placeholder – styled in CSS */}
        <div className="sparkline-placeholder" />
      </div>

      {/* Active Alarms – placeholder for now */}
      <div className="kpi-card-right">
        <h4>Active Alarms</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">2</span>
          <span className="kpi-main-sub">Pending Alerts</span>
        </div>
      </div>

      {/* FPY – clickable for drill-down */}
      <div
        className="kpi-card-right"
        onClick={onFpyClick}
        style={{ cursor: onFpyClick ? "pointer" : "default" }}
      >
        <h4>Machine FPY</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">
            {fpyPct != null ? `${fpyPct}%` : "—"}
          </span>
          <span className="kpi-main-sub">Holds: {holdsCount}</span>
        </div>
      </div>

      {/* Machine Run Status – simple bar rows from availability */}
      <div className="kpi-card-right">
        <h4>Machine Run Status</h4>
        {runStatus.length ? (
          runStatus.map((r) => (
            <div className="progress-row" key={r.line}>
              <span>{r.line}</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${r.pct}%` }}
                />
              </div>
              <span className="progress-val">{r.pct}%</span>
            </div>
          ))
        ) : (
          <p className="kpi-sub-line">No availability data.</p>
        )}
      </div>

      {/* Silo Coverage – clickable for silo events if handler given */}
      <div
        className="kpi-card-right"
        onClick={onSiloClick}
        style={{ cursor: onSiloClick ? "pointer" : "default" }}
      >
        <h4>Silo Coverage</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">
            {siloHasData ? "OK" : "No Data"}
          </span>
          <span className="kpi-main-sub">Material Levels</span>
        </div>
      </div>

      {/* Steam per Ton (if endpoint available) */}
      <div className="kpi-card-right">
        <h4>Steam per Ton</h4>
        <div className="kpi-main-row">
          <span className="kpi-main-value">
            {steamPerTon != null ? `${steamPerTon} kg/t` : "0.0 kg/t"}
          </span>
          <span className="kpi-main-sub">
            Total Steam: {steamTotal != null ? `${steamTotal} kg` : "0.0 kg"}
          </span>
        </div>
      </div>

      {loading && <p className="loading">Loading…</p>}
    </div>
  );
}
