import { useState } from 'react';

const ACHIEVEMENTS = {
  first_blood: {
    title: "First Blood",
    description: "Get your first kill in battle"
  },
  veteran: {
    title: "Veteran",
    description: "Reach level 10"
  },
  collector: {
    title: "Collector",
    description: "Obtain 5 different weapons"
  }
};

export default function useAchievements() {
  const [achievements, setAchievements] = useState([]);

  const unlockAchievement = (id) => {
    if (!achievements.includes(id) && ACHIEVEMENTS[id]) {
      setAchievements(prev => [...prev, id]);
      return true;
    }
    return false;
  };

  return { achievements, unlockAchievement };
}
