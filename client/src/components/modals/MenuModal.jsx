import React, { useState } from 'react';
import '../../styles/modals.css'; // You can separate if needed

export default function MenuModal({ visible, player, onClose, onLogout, onUpdateName, playHoverSound }) {
  const [newName, setNewName] = useState(player?.name || '');
  const [volume, setVolume] = useState(0.5);

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content menu-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <div className="menu-section">
          <label>Change Name:</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onFocus={playHoverSound}
          />
          <button onClick={() => onUpdateName(newName)}>Update</button>
        </div>

        <div className="menu-section">
          <label>Volume:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            onInput={playHoverSound}
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>

        <div className="menu-section">
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>

        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
