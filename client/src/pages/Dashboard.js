// src/pages/Dashboard.js
import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import '../styles/dashboard.css';

import PlayerStatsCard from '../components/dashboard/PlayerStatsCard';
import usePlayerModel from '../hooks/usePlayerModel';
import useInventory from '../hooks/useInventory';
import useFriends from '../hooks/useFriends';
import useAchievements from '../hooks/useAchievements';

import InventoryModal from '../components/modals/InventoryModal';
import FriendsModal from '../components/modals/FriendsModal';
import CustomizationModal from '../components/modals/CustomizationModal';
import AchievementToast from '../components/modals/AchievementToast';
import MenuModal from '../components/modals/MenuModal';
import LoadingScreen from '../components/common/LoadingScreen';

import HeroModel from '../components/HeroModel';
import { FirebaseUserService } from '../services/firebaseUserService';

export default function Dashboard() {
  const navigate = useNavigate();
  const hoverSoundRef = useRef(null);

  const [showInventory, setShowInventory] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { playerData, loading, setPlayerData } = usePlayerModel();
  const { inventory, equippedWeapon, handleEquip, handleUnequip } = useInventory();
  const {
    friends,
    requestsReceived,
    searchId,
    setSearchId,
    searchResult,
    setSearchResult,
    handleSearch,
    handleFriendRequest,
  } = useFriends();
  const { achievements, unlockAchievement } = useAchievements();

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    const playerId = localStorage.getItem('playerId');
    if (!uid || !playerId) {
      navigate('/login');
    } else {
      FirebaseUserService.setOnlineStatus(uid);
    }
  }, [navigate]);

  // Debug: Log player data
  useEffect(() => {
    console.log('Dashboard playerData:', playerData);
  }, [playerData]);

  const playHoverSound = useCallback(() => {
    if (hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current.play().catch(console.error);
    }
  }, []);

  const handleAvatarChange = async (base64) => {
    const uid = localStorage.getItem('uid');
    const updated = { ...playerData, avatar: base64 };
    setPlayerData(updated);

    if (uid) {
      await FirebaseUserService.updateProfile(uid, { avatar: base64 });
    }
  };

  if (loading) return <LoadingScreen message="Loading player data..." />;

  return (
    <div className="dashboard-container">
      <audio ref={hoverSoundRef} src="/assets/hover.mp3" preload="auto" />

      {/* Debug: Always show a test profile box */}
      <div className="player-stats-box" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <div className="avatar-section">
          <img
            src="/assets/avatar.webp"
            alt="Player Avatar"
            className="profile-avatar"
          />
          <div className="status-dot online"></div>
        </div>
        <div className="info-section">
          <div className="player-name">Test Player</div>
          <div className="player-id">ID: 12345</div>
        </div>
      </div>

      {/* Player Profile Box - Top Left */}
      {playerData && (
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 11 }}>
          <PlayerStatsCard player={playerData} onAvatarChange={handleAvatarChange} />
        </div>
      )}

      <div className="glow-ring"></div>

      {/* 3D Character */}
      <div className="character-display">
        <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Suspense fallback={null}>
            <HeroModel />
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>

      {/* Start Button */}
      <div className="bottom-left">
        <button className="start-button" onClick={() => navigate('/game-room')} onMouseEnter={playHoverSound}>
          START
        </button>
      </div>

      {/* Utility Buttons */}
      <div className="bottom-right">
        <button className="utility-button" title="Shop" onClick={() => alert('Shop')} onMouseEnter={playHoverSound}>
          🛒
        </button>
        <button className="utility-button" title="Inventory" onClick={() => setShowInventory(true)} onMouseEnter={playHoverSound}>
          🎒
        </button>
        <div className="friends-button-wrapper">
          <button className="utility-button" title="Friends" onClick={() => setShowFriends(true)} onMouseEnter={playHoverSound}>
            👥
          </button>
          {requestsReceived.length > 0 && <span className="friend-badge">{requestsReceived.length}</span>}
        </div>
        <button className="utility-button" title="Settings" onClick={() => setShowMenu(true)} onMouseEnter={playHoverSound}>
          ⚙️
        </button>
      </div>

      {/* Modals */}
      <InventoryModal
        visible={showInventory}
        items={inventory}
        equippedWeapon={equippedWeapon}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        onClose={() => setShowInventory(false)}
      />
      <FriendsModal
        visible={showFriends}
        friends={friends}
        searchId={searchId}
        setSearchId={setSearchId}
        searchResult={searchResult}
        setSearchResult={setSearchResult}
        onSearch={handleSearch}
        onFriendAction={handleFriendRequest}
        onClose={() => setShowFriends(false)}
        playHoverSound={playHoverSound}
      />
      <CustomizationModal
        visible={showCustomization}
        player={playerData}
        onSave={setPlayerData}
        onClose={() => setShowCustomization(false)}
        playHoverSound={playHoverSound}
      />
      <MenuModal
        visible={showMenu}
        player={playerData}
        onClose={() => setShowMenu(false)}
        onLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
        onUpdateName={(newName) => setPlayerData({ ...playerData, name: newName })}
        playHoverSound={playHoverSound}
      />
      <AchievementToast achievements={achievements} onUnlock={unlockAchievement} />
    </div>
  );
}