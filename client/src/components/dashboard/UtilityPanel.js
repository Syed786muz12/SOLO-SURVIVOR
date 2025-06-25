import React from 'react';
import { FaBoxOpen,  FaCog, FaUserFriends } from 'react-icons/fa';
import '../../styles/dashboard.css';

export default function UtilityPanel({
  onInventoryToggle,
  onCustomizeToggle,
  onFriendsToggle,
  onSpectateToggle,
  isSpectatorMode,
  friendRequests,
  playHoverSound
}) {
  const handleClick = (callback) => {
    playHoverSound();
    callback();
  };

  return (
    <div className="utility-buttons-container">
      <button
        className="utility-button"
        title="Inventory"
        onClick={() => handleClick(onInventoryToggle)}
      >
        <FaBoxOpen />
      </button>

      <button
        className="utility-button"
        title="Friends"
        onClick={() => handleClick(onFriendsToggle)}
      >
        <FaUserFriends />
        {friendRequests > 0 && <span className="friend-request-dot"></span>}
      </button>

      <button
        className="utility-button"
        title="Customize"
        onClick={() => handleClick(onCustomizeToggle)}
      >
        <FaCog />
      </button>
    </div>
  );
}
