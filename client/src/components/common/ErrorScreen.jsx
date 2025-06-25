import React from 'react';
import '../../styles/screenStates.css';

export default function ErrorScreen({ error, onRetry }) {
  return (
    <div className="screen-overlay error-screen">
      <div className="screen-box">
        <h2 className="screen-title">⚠ Error Occurred</h2>
        <p className="screen-text">{error}</p>
        <button className="screen-button" onClick={onRetry || (() => window.location.reload())}>
          Retry
        </button>
      </div>
    </div>
  );
}
