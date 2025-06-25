// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GameRoom from "./pages/GameRoom";
import "./App.css";

// Add this export statement (either named or default)
const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-room" element={<GameRoom />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App; // This is the crucial fix