// components/SettingsMenu.js
import React from "react";

const SettingsMenu = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-20 bg-black bg-opacity-70 flex items-center justify-center pointer-events-auto">
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <h2 className="text-2xl font-bold mb-4">Game Menu</h2>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 py-2 rounded">Settings</button>
          <button className="w-full bg-gray-700 py-2 rounded">Change Team</button>
          <button className="w-full bg-red-500 py-2 rounded">Leave Game</button>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 py-2 rounded"
          >
            Resume Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
