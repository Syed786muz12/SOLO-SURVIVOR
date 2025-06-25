import React, { useState, useEffect } from "react";
import { socketService } from "../services/socket";
import "./Matchmaking.css";

const MIN_WAIT = 30; // seconds
const MAX_WAIT = 50; // seconds

export default function Matchmaking({ onMatchFound, onAIMatch }) {
  const [timeLeft, setTimeLeft] = useState(MAX_WAIT);
  const [status, setStatus] = useState("Searching for match...");
  const [playersFound, setPlayersFound] = useState(1);
  const [isAIMatchStarted, setIsAIMatchStarted] = useState(false);

  useEffect(() => {
    // Player enters matchmaking
    socketService.emit("join-queue");

    // Random timeout between MIN_WAIT and MAX_WAIT
    const matchDuration = Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT + 1)) + MIN_WAIT;

    const matchTimer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(matchTimer);
          if (!isAIMatchStarted) startAIMatch();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Matchmaking updates
    socketService.on("match-update", (data) => {
      setPlayersFound(data.playersFound);
      setStatus(`${data.playersFound}/2 players found`);
    });

    // Real match found
    socketService.on("match-found", (players) => {
      clearInterval(matchTimer);
      setStatus("Match found! Starting...");
      setTimeout(() => onMatchFound(players), 2000);
    });

    // Cleanup
    return () => {
      clearInterval(matchTimer);
      socketService.off("match-update");
      socketService.off("match-found");
    };
  }, [onMatchFound, onAIMatch]);

  const startAIMatch = () => {
    setIsAIMatchStarted(true);
    setStatus("Starting with AI opponent...");
    setTimeout(() => {
      const aiPlayers = [
        { id: 'ai1', name: 'AI_Opponent', team: 'red', isAI: true }
      ];
      onAIMatch(aiPlayers);
    }, 2000);
  };

  return (
    <div className="matchmaking-container">
      <div className="matchmaking-card fade-in">
        <h2 className="matchmaking-title">TEAM DEATHMATCH</h2>

        <div className="search-animation">
          <div className="circle-loader"></div>
          <p className="search-status">{status}</p>
        </div>

        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(playersFound / 2) * 100}%` }}
          />
        </div>

        <div className="countdown-timer">
          <span className="count">{timeLeft}s</span>
          <span className="sub-label">until AI fill</span>
        </div>

        <p className="waiting-hint">
          {timeLeft > 0 ? "Waiting for players..." : "AI opponent being added..."}
        </p>
      </div>
    </div>
  );
}
