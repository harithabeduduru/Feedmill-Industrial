export const fmt = (v, suffix = "") => {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v}${suffix}`;
};

export const fmtPercent = (v) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "—%";
  return `${v}%`;
};

export const fmtDecimal = (v, decimals = 2, suffix = "") => {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(decimals)}${suffix}`;
};
