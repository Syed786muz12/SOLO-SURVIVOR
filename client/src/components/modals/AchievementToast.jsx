import React, { useEffect, useState } from 'react';
import '../../styles/modals.css';

const ACHIEVEMENT_DETAILS = {
  first_blood: { title: "First Blood", description: "Get your first kill in battle" },
  veteran: { title: "Veteran", description: "Reach level 10" },
  collector: { title: "Collector", description: "Obtain 5 different weapons" },
};

export default function AchievementToast({ achievements, onUnlock }) {
  const [visible, setVisible] = useState(false);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    if (achievements.length > 0) {
      const lastId = achievements[achievements.length - 1];
      const data = ACHIEVEMENT_DETAILS[lastId] || { title: "Unknown", description: "" };
      setLatest(data);
      setVisible(true);
      onUnlock(lastId);

      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [achievements, onUnlock]);

  if (!visible || !latest) return null;

  return (
    <div className="toast-container">
      <div className="toast-content">
        <strong>Achievement Unlocked!</strong>
        <p>{latest.title}</p>
        <small>{latest.description}</small>
      </div>
    </div>
  );
}
