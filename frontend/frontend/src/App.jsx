import React, { useEffect, useState } from "react";
import {
  getProduction,
  getSEC,
  getFPY,
  getSilos,
  getAvailability,
  getSteamPerTon,
} from "./api.jsx";
import KpiTiles from "./components/KpiTiles.jsx";
import Plant3D from "./components/Plant3D.jsx";
import Drawer from "./components/Drawer.jsx";
import TimeFilter from "./components/TimeFilter.jsx";
import LeftPanel from "./components/LeftPanel.jsx";

export default function App() {
  const [production, setProduction] = useState(null);
  const [sec, setSec] = useState(null);
  const [fpy, setFpy] = useState(null);
  const [silos, setSilos] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [steam, setSteam] = useState(null);

  const [period, setPeriod] = useState("WTD");
  const [selectedEquip, setSelectedEquip] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [drawerMode, setDrawerMode] = useState(null); // "fpy" | "silo" | null

  async function loadAll(p) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [
        prod,
        secRes,
        fpyRes,
        silosRes,
        availRes,
        steamRes,
      ] = await Promise.all([
        getProduction(p),
        getSEC(p),
        getFPY(p),
        getSilos(p),
        getAvailability(p),
        getSteamPerTon(p),
      ]);
      setProduction(prod);
      setSec(secRes);
      setFpy(fpyRes);
      setSilos(silosRes);
      setAvailability(availRes);
      setSteam(steamRes);
    } catch (err) {
      console.error("Error loading KPIs:", err);
      setErrorMsg("Failed to load some KPIs from backend. Check console.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <div className="app-root">
      {/* Top tiny bar */}
      <div className="topbar">
        <div className="topbar-title">Public View</div>
      </div>

      <div className="main-shell">
        {/* Header area: title + tabs + time filter */}
        <header className="main-header">
          <div className="main-header-left">
            <h1 className="dashboard-title">Feed-Mill Digital Twin</h1>
            <div className="mode-tabs">
              <button className="mode-tab active">Awareness</button>
              <button className="mode-tab">Storehouse</button>
              <button className="mode-tab">Comprehensive</button>
            </div>
          </div>

          <div className="main-header-right">
            <TimeFilter value={period} onChange={setPeriod} />
          </div>
        </header>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        {/* 3-column layout */}
        <main className="main-columns">
          {/* LEFT COLUMN – intro + silos/health/status */}
          <aside className="col-left">
            <LeftPanel silos={silos} />
          </aside>

          {/* CENTER COLUMN – 3D plant */}
          <section className="col-center">
            <div className="center-status-bar">
              <div className="center-status-left">
                <span className="status-pill status-connected">Connected</span>
                <span>FPS 60</span>
                <span>Last Update: 2025-10-07 10:14:18</span>
              </div>
              <div className="center-toggle-group">
                <button className="toggle-btn active">Turn ON</button>
                <button className="toggle-btn">Turn OFF</button>
              </div>
            </div>

            <div className="center-3d-wrapper">
              <Plant3D
                selectedId={selectedEquip?.id}
                onSelect={(equip) => setSelectedEquip(equip)}
              />
            </div>

            <div className="center-timelineBar">
              <div className="timeline-periods">
                <button className="timeline-btn">Year</button>
                <button className="timeline-btn">Month</button>
                <button className="timeline-btn active">Week</button>
                <button className="timeline-btn">Day</button>
              </div>

              <div className="timeline-controls">
                <button className="timeline-icon">⏪</button>
                <button className="timeline-icon">⏯</button>
                <button className="timeline-icon">⏩</button>
              </div>

              <div className="timeline-speed">
                <span>1x</span>
                <span>2x</span>
                <span>4x</span>
                <span>8x</span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN – KPIs */}
          <aside className="col-right">

          <KpiTiles
            production={production}
            sec={sec}
            fpy={fpy}
            silos={silos}
            availability={availability}
            steam={steam}
            loading={loading}
            onFpyClick={() => setDrawerMode("fpy")}
            onSiloClick={() => setDrawerMode("silo")}
          />

          </aside>
        </main>
      </div>

      {/* Drawer triggered by 3D equipment click */}
      <Drawer
        open={!!selectedEquip}
        onClose={() => setSelectedEquip(null)}
        title={selectedEquip?.name || ""}
      >
        {selectedEquip ? (
          <div>
            <h4>{selectedEquip.name}</h4>
            <p>Type: {selectedEquip.type}</p>
            <p>KPIs from dataset:</p>
            <ul>
              {selectedEquip.kpis.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
            <p className="muted">
              Values are derived from production, energy, quality and silo
              tables in the CSV bundle.
            </p>
          </div>
        ) : (
          <div>Select equipment on the 3D plant to view KPIs.</div>
        )}
      </Drawer>

      <footer className="footer">
        Backend: <code>http://localhost:8000/api</code>
      </footer>
    </div>
  );
}
