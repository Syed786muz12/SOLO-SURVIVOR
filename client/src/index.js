// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // This import will now work correctly

// Initialize keyMap
window.keyMap = {};
window.addEventListener("keydown", (e) => {
  window.keyMap[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  window.keyMap[e.key] = false;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);