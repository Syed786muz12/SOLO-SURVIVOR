import React, { useState, useEffect, useRef } from "react";

export default function Player({ id, side, onAttack }) {
  const [action, setAction] = useState("idle");
  const playerRef = useRef(null);

  const handleKeyDown = (e) => {
    if ((side === "left" && e.key === "d") || (side === "right" && e.key === "ArrowLeft")) {
      move("forward");
    } else if ((side === "left" && e.key === "a") || (side === "right" && e.key === "ArrowRight")) {
      move("backward");
    } else if ((side === "left" && e.key === "w") || (side === "right" && e.key === "ArrowUp")) {
      attack();
    }
  };

  const move = (direction) => {
    const player = playerRef.current;
    if (!player) return;

    const offset = direction === "forward" ? 10 : -10;
    player.style.left = `${player.offsetLeft + offset}px`;
    setAction("run");
  };

  const attack = () => {
    setAction("attack");
    onAttack();
    setTimeout(() => setAction("idle"), 500);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sprite = `/assets/${id}/${action}.png`;

  return (
    <div
      ref={playerRef}
      className={`player ${side}`}
      style={{ backgroundImage: `url(${sprite})` }}
    />
  );
}
