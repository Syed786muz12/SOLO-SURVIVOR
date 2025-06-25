// src/components/modals/FriendsModal.js
import React from 'react';
import '../../styles/modals.css';

export default function FriendsModal({
  visible,
  friends,
  searchId,
  setSearchId,
  searchResult,
  setSearchResult,
  onSearch,
  onFriendAction,
  onClose,
  playHoverSound
}) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content friends-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Friends</h2>

        <div className="search-section">
          <input
            type="text"
            placeholder="Enter Player ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onFocus={playHoverSound}
          />
          <button onClick={() => { playHoverSound(); onSearch(searchId); }}>Search</button>
        </div>

        {searchResult && (
          <div className="search-result">
            <span>{searchResult.name} ({searchResult.id})</span>
            <button onClick={() => onFriendAction('add', searchResult.id)}>Add Friend</button>
          </div>
        )}

        <div className="friends-list">
          <h3>Friend List</h3>
          {friends.length === 0 && <p>No friends yet.</p>}
          {friends.map((f, i) => (
            <div key={i} className="friend-item">
              <span>{f.name} ({f.id})</span>
              <button className="danger" onClick={() => onFriendAction('remove', f.id)}>Remove</button>
            </div>
          ))}
        </div>

        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
