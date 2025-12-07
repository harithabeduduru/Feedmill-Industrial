import React from "react";

export default function Drawer({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}
