import React from 'react';
import '../../styles/dashboard.css';

export default function ActionButtons({ onStartGame, playHoverSound }) {
  const handleClick = () => {
    playHoverSound();
    onStartGame();
  };

  return (
    <div className="start-button-container">
      <button className="start-button" onClick={handleClick}>
        START
      </button>
    </div>
  );
}