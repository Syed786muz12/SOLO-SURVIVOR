import React, { useState, useEffect } from 'react';
import '../../styles/modals.css';

const characterOptions = [
  { name: "Default Soldier", value: "/assets/models/character.glb" },
  { name: "Sniper Suit", value: "/assets/models/sniper.glb" },
  { name: "Stealth Operative", value: "/assets/models/stealth.glb" },
];

export default function CustomizationModal({ visible, player, onSave, onClose, playHoverSound }) {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedModel, setSelectedModel] = useState(characterOptions[0].value);

  useEffect(() => {
    if (player) {
      setSelectedColor(player.color || '#ffffff');
      setSelectedModel(player.character || characterOptions[0].value);
    }
  }, [player]);

  if (!visible || !player) return null;

  const saveChanges = () => {
    onSave({ ...player, color: selectedColor, character: selectedModel });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content customization-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Character Customization</h2>

        <div className="custom-section">
          <label>Choose Color:</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            onInput={playHoverSound}
          />
        </div>

        <div className="custom-section">
          <label>Select Character:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            onInput={playHoverSound}
          >
            {characterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="button-row">
          <button onClick={saveChanges}>Save</button>
          <button className="close-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
