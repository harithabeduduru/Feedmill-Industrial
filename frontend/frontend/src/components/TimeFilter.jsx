import React from "react";

const OPTIONS = ["Today", "Yesterday", "WTD", "MTD"];

export default function TimeFilter({ value, onChange }) {
  return (
    <div className="time-filter">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          className={`tf-btn ${value === opt ? "active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
