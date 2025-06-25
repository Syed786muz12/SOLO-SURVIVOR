// src/components/dashboard/PlayerStatsCard.js
import React, { useRef } from 'react';
import '../../styles/dashboard.css';

export default function PlayerStatsCard({ player, onAvatarChange }) {
  const fileInputRef = useRef(null);

  if (!player) return null;

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onAvatarChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result); // base64 avatar
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="player-profile-box">
      <div className="profile-container">
        <div className="avatar-section" onClick={handleImageClick} title="Click to change avatar">
          <img
            src={player.avatar || '/assets/avatar.webp'}
            alt="Player Avatar"
            className="profile-avatar"
            onError={(e) => (e.target.src = '/assets/avatar.webp')}
          />
          <div className={`status-dot ${player.status === 'online' ? 'online' : 'offline'}`}></div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <div className="profile-info">
          <div className="player-name">{player.name || 'Unknown Player'}</div>
          <div className="player-id">ID: {player.id || player.uid || 'Not Found'}</div>
        </div>
      </div>
    </div>
  );
}