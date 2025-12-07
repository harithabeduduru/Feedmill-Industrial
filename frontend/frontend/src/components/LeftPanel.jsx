import React from "react";

function computeSiloPercents(silos) {
  if (!silos?.silo_latest_levels?.length) return null;

  const row = silos.silo_latest_levels[0];

  const levelEntries = Object.entries(row).filter(([k]) =>
    k.endsWith("_level_t")
  );

  if (!levelEntries.length) return null;

  // Assume 20t capacity per silo for simple visualization
  const capacity = 20;
  return levelEntries.map(([key, value]) => {
    const name = key.replace("_level_t", "").replace("RM-", "").replace("_", " ");
    const pct = Math.max(
      0,
      Math.min(100, (Number(value || 0) / capacity) * 100)
    );
    return { key, name, pct: Math.round(pct) };
  });
}

export default function LeftPanel({ silos }) {
  const siloPercents = computeSiloPercents(silos);
  const siloCount = siloPercents ? siloPercents.length : 0;

  return (
    <div className="left-panel">
      {/* Plant introduction card */}
      <div className="left-card">
        <div className="left-card-header">
          <h4>Plant Introduction</h4>
        </div>
        <div className="left-card-body">
          <div className="plant-thumbnail" />
          <p className="left-card-text">
            This feed mill processes raw materials through silos, mixer,
            conditioner and pellet mill to produce finished feed. The digital
            twin visualizes real-time operations, material flows, machine
            status, and energy usage for a clear understanding of plant
            performance.
          </p>
        </div>
      </div>

      {/* Silo material overview – now driven by backend */}
      <div className="left-card">
        <div className="left-card-header">
          <h4>Silo Material Overview</h4>
        </div>
        <div className="left-card-body">
          {siloPercents ? (
            siloPercents.map((s) => (
              <div className="progress-row" key={s.key}>
                <span>{s.name}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <span className="progress-val">{s.pct}%</span>
              </div>
            ))
          ) : (
            <p className="left-card-text-muted">No silo data available.</p>
          )}
          <p className="left-card-text-muted">
            Tracking {siloCount} silos from the dataset.
          </p>
        </div>
      </div>

      {/* Inventory health – static but looks like Figma */}
      <div className="left-card">
        <div className="left-card-header">
          <h4>Inventory Health</h4>
        </div>
        <div className="left-card-body">
          <div className="progress-row">
            <span>Raw Material Sufficiency</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "92%" }} />
            </div>
            <span className="progress-val">92%</span>
          </div>
          <div className="progress-row">
            <span>Turnover Efficiency</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "78%" }} />
            </div>
            <span className="progress-val">78%</span>
          </div>
        </div>
      </div>

      {/* Status summary – static */}
      <div className="left-card">
        <div className="left-card-header">
          <h4>Status Summary</h4>
        </div>
        <div className="left-card-body">
          <ul className="status-list">
            <li>● Operating Normally</li>
            <li>● Alerts – 2</li>
            <li>● Maintenance Scheduled</li>
            <li>● Energy Normal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
