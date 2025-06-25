import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { rtdb as database } from '../services/firebase';

const defaultPlayerData = {
  name: "Player",
  id: "player_001",
  xp: 0,
  level: 1,
  status: "Ready",
  avatar: "/assets/avatar.webp",
  character: "/assets/ai_character.glb",
  background: "/assets/bg-dashboard.jpg"
};

export default function usePlayerModel() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error("User ID not found in localStorage");

        const snapshot = await get(ref(database, `players/${userId}`));
        setPlayerData(snapshot.exists() ? snapshot.val() : defaultPlayerData);
      } catch (err) {
        setError(err.message || "Failed to load player data.");
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, []);

  return { playerData, loading, error, setPlayerData };
}
