# Feedmill 5 TPH – Industrial Dashboard  
Full-Stack Developer Assignment – ASM India  
Tech Stack: FastAPI • React • React Three Fiber • Pandas

---

## 📌 Overview

This project is a one-page Industrial Dashboard for a realistic **5 TPH Feedmill**.  
It provides plant managers a real-time operational overview of:

- Production vs Plan  
- Energy & Steam Efficiency  
- Availability  
- Quality (FPY)  
- Silo Material Coverage  
- Steam Conditioning  
- Packaging & Dispatch  
- Interactive 3D Plant Monitoring  

The backend (FastAPI) loads and processes the provided mock CSV dataset.  
The frontend (React + Vite) visualizes all KPIs and integrates a 3D Plant View.

---

## 🚀 Features

### ✔ KPI Dashboard
- Production (Actual, Plan, Attainment %)
- SEC (kWh/t)
- FPY (First Pass Yield)
- Machine Availability (RUN %)
- Steam per Ton (kg/t)
- Silo Levels + Events
- Machine Run Status
- Active Alarms (placeholder)

### ✔ Interactive 3D Plant View
Built using **React Three Fiber**  
Includes:
- Raw Material Silos  
- Mixer  
- Conditioner  
- Pellet Mill  
- Bagging Line  
- Utilities Block  

Clicking any equipment opens a **right-side KPI drawer panel**.

### ✔ Drill-down Panels
- FPY → last HOLD samples  
- Silos → LOW_LEVEL / CHANGEOVER events  
- Equipment → KPIs (steam, bagging, DOC, batch accuracy, etc.)

### ✔ Global Filters
- Today  
- Yesterday  
- WTD (default)  
- MTD  

All filters refresh all KPIs dynamically.

---

## 📁 Project Structure

```
feedmill-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── kpi.py
│   │   └── loaders.py
│   ├── data/
│   │   └── *.csv (mock dataset)
│   ├── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.jsx
    │   ├── index.css
    │   ├── utils/format.js
    │   └── components/
    │       ├── KpiTiles.jsx
    │       ├── Plant3D.jsx
    │       ├── Drawer.jsx
    │       └── TimeFilter.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🖥️ Backend Setup (FastAPI)

### Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Run FastAPI server
```bash
uvicorn app.main:app --reload --port 8000
```

The backend runs at:
```
http://127.0.0.1:8000/api
```

---

## 🖼️ Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173/
```

---

## 🔌 API Endpoints

```
GET /api/kpi/production?period=WTD
GET /api/kpi/energy/sec?period=WTD
GET /api/kpi/fpy?period=WTD
GET /api/kpi/silos?period=WTD
GET /api/kpi/availability?period=WTD
GET /api/kpi/steam?period=WTD
```

---

## 🎥 Demo Video (2–5 min)

Record and show:

1. Start backend (FastAPI running)  
2. Start frontend (dashboard loads)  
3. Switch filters (Today / Yesterday / WTD / MTD)  
4. KPIs update dynamically  
5. 3D plant view interaction (zoom, rotate)  
6. Clicking equipment → drawer opens  
7. FPY drill-down  
8. Silo events drill-down  
9. Smooth UI/UX navigation  

---

## 📦 Deliverables

- GitHub Repo or ZIP file  
- Demo Video (2–5 minutes)  
- README.md (this file)

---


