import React from "react";
import "../styles/HUD.css";

export default function HUD({ health1, health2, winner }) {
  return (
    <div className="hud">
      <div className="health-bar">
        <div className="label">Player 1</div>
        <div className="bar">
          <div className="fill" style={{ width: `${health1}%` }} />
        </div>
      </div>
      <div className="health-bar">
        <div className="label">Player 2</div>
        <div className="bar">
          <div className="fill" style={{ width: `${health2}%`, backgroundColor: "#f00" }} />
        </div>
      </div>
      {winner && <div className="winner">🏆 {winner} Wins!</div>}
    </div>
  );
}
