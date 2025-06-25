// hooks/usePlayerAbilities.js
import { useState, useEffect } from "react";

// Optional: Central config for cooldowns
const COOLDOWN_DURATIONS = {
  dash: 5,
  shield: 10
};

export const usePlayerAbilities = (playerId) => {
  const [cooldowns, setCooldowns] = useState({
    dash: 0,
    shield: 0
  });

  // Timer to decrement cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) updated[key] -= 1;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Trigger ability if not on cooldown
  const triggerAbility = (type) => {
    if (!cooldowns.hasOwnProperty(type)) return false;
    if (cooldowns[type] > 0) return false;

    console.log(`${type} used by`, playerId);

    setCooldowns((prev) => ({
      ...prev,
      [type]: COOLDOWN_DURATIONS[type] || 5
    }));

    return true;
  };

  return {
    abilities: { ...cooldowns },
    triggerAbility
  };
};
