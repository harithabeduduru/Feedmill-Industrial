import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

async function safeGet(path) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await axios.get(url, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error("API error:", url, err.message);
    throw err;
  }
}

export const getProduction = (period) =>
  safeGet(`/kpi/production?period=${encodeURIComponent(period)}`);

export const getSEC = (period) =>
  safeGet(`/kpi/energy/sec?period=${encodeURIComponent(period)}`);

export const getFPY = (period) =>
  safeGet(`/kpi/fpy?period=${encodeURIComponent(period)}`);

export const getSilos = (period) =>
  safeGet(`/kpi/silos?period=${encodeURIComponent(period)}`);

// Optional endpoints – if they exist in backend they'll work, otherwise we swallow errors
export const getAvailability = async (period) => {
  try {
    return await safeGet(`/kpi/availability?period=${encodeURIComponent(period)}`);
  } catch {
    return null;
  }
};

export const getSteamPerTon = async (period) => {
  try {
    return await safeGet(`/kpi/steam-per-ton?period=${encodeURIComponent(period)}`);
  } catch {
    return null;
  }
};
