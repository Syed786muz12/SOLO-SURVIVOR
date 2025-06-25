import React, { useState, useEffect } from "react";
import Player from "./Player";
import HUD from "./HUD";
import "../styles/GameRoom.css";

export default function GameRoom() {
  const [health1, setHealth1] = useState(100);
  const [health2, setHealth2] = useState(100);
  const [winner, setWinner] = useState(null);

  const handleAttack = (attacker) => {
    if (winner) return;

    if (attacker === "player1") {
      setHealth2((prev) => {
        const newHealth = Math.max(prev - 10, 0);
        if (newHealth <= 0) setWinner("Player 1");
        return newHealth;
      });
    } else {
      setHealth1((prev) => {
        const newHealth = Math.max(prev - 10, 0);
        if (newHealth <= 0) setWinner("Player 2");
        return newHealth;
      });
    }
  };

  return (
    <div className="game-room">
      <img src="/assets/arena.png" alt="Arena" className="arena-bg" />

      <HUD health1={health1} health2={health2} winner={winner} />

      <div className="players">
        <Player
          id="player1"
          side="left"
          onAttack={() => handleAttack("player1")}
        />
        <Player
          id="player2"
          side="right"
          onAttack={() => handleAttack("player2")}
        />
      </div>
    </div>
  );
}
