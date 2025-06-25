import React from 'react';
import '../../styles/dashboard.css';

export default function StatusBar({ status, isArmed }) {
  return (
    <div className="status-bar-container">
      <div className="status-text">
        {status || "Offline"} {isArmed && <span className="armed-indicator">• Armed</span>}
      </div>
    </div>
  );
}