require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Game Constants
const CONFIG = {
  PLAYER: {
    MAX_HEALTH: 100,
    RESPAWN_TIME: 5000, // 5 seconds
    HITBOX: {
      RADIUS: 0.5,
      HEIGHT: 2
    }
  },
  WEAPONS: {
    RIFLE: { damage: 20, range: 50, cooldown: 100 },
    SHOTGUN: { damage: 10, range: 30, cooldown: 800 },
    SNIPER: { damage: 50, range: 100, cooldown: 1500 }
  },
  ABILITIES: {
    DASH: { cooldown: 10000 },
    HEAL: { cooldown: 30000, amount: 30 },
    SPECIAL: { cooldown: 60000 }
  },
  GAME: {
    MODES: ["deathmatch", "team-deathmatch", "battle-royale"],
    LOOT_TYPES: ["ammo", "health", "armor"]
  }
};

// Game State
const gameState = {
  players: new Map(),       // Map<playerId, playerData>
  bullets: new Map(),       // Map<bulletId, bulletData>
  scoreboard: new Map(),    // Map<playerId, score>
  abilities: new Map(),     // Map<`${playerId}-${ability}`, timestamp>
  loot: new Map(),          // Map<lootId, lootData>
  chatHistory: [],          // Array<chatMessage>
  gameStartTime: Date.now(),
  gameMode: CONFIG.GAME.MODES[0],
  map: "warehouse"
};

// Utility Functions
const getRandomSpawn = () => [
  (Math.random() - 0.5) * 40, // x (-20 to 20)
  1,                           // y
  (Math.random() - 0.5) * 40   // z (-20 to 20)
];

const calculateDamage = (weaponType, isHeadshot = false) => {
  const baseDamage = CONFIG.WEAPONS[weaponType.toUpperCase()]?.damage || CONFIG.WEAPONS.RIFLE.damage;
  return isHeadshot ? baseDamage * 1.5 : baseDamage;
};

// Game Logic
const broadcastGameState = () => {
  io.emit("game-state-update", {
    players: Array.from(gameState.players.values()),
    bullets: Array.from(gameState.bullets.values()),
    scoreboard: Object.fromEntries(gameState.scoreboard),
    loot: Array.from(gameState.loot.values()),
    gameTime: Math.max(0, 300 - Math.floor((Date.now() - gameState.gameStartTime) / 1000)),
    chatMessages: gameState.chatHistory.slice(-50)
  });
};

const handlePlayerHit = (attackerId, victimId, weaponType, isHeadshot = false) => {
  const victim = gameState.players.get(victimId);
  if (!victim || victim.health <= 0) return false;

  const damage = calculateDamage(weaponType, isHeadshot);
  victim.health = Math.max(0, victim.health - damage);

  io.emit("player-hit", {
    targetId: victimId,
    damage,
    shooterId: attackerId,
    type: isHeadshot ? "headshot" : "normal"
  });

  if (victim.health <= 0) {
    handlePlayerDeath(victimId, attackerId);
    return true;
  }
  return false;
};

const handlePlayerDeath = (victimId, killerId) => {
  const victim = gameState.players.get(victimId);
  const killer = gameState.players.get(killerId);

  if (!victim) return;

  // Update scoreboard
  const killerScore = gameState.scoreboard.get(killerId) || 0;
  gameState.scoreboard.set(killerId, killerScore + 1);

  // Broadcast death event
  io.emit("player-died", { 
    id: victimId, 
    killerId,
    position: victim.position 
  });

  // Handle respawn
  setTimeout(() => {
    if (gameState.players.has(victimId)) {
      const respawnPos = getRandomSpawn();
      gameState.players.get(victimId).position = respawnPos;
      gameState.players.get(victimId).health = CONFIG.PLAYER.MAX_HEALTH;
      io.emit("player-respawn", {
        id: victimId,
        position: respawnPos,
        health: CONFIG.PLAYER.MAX_HEALTH
      });
      broadcastGameState();
    }
  }, CONFIG.PLAYER.RESPAWN_TIME);
};

const spawnLoot = (position, type = "ammo") => {
  const lootId = `loot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  gameState.loot.set(lootId, {
    id: lootId,
    position,
    type,
    ttl: 10 // Time to live in seconds
  });

  // Remove loot after TTL expires
  setTimeout(() => {
    gameState.loot.delete(lootId);
    broadcastGameState();
  }, 10000);
};

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Initialize new player
  gameState.players.set(socket.id, {
    id: socket.id,
    position: getRandomSpawn(),
    health: CONFIG.PLAYER.MAX_HEALTH,
    name: `Player_${socket.id.slice(0, 4)}`,
    team: Math.random() > 0.5 ? "red" : "blue",
    model: "/assets/default-character.glb",
    animation: "idle",
    weapon: "rifle",
    kills: 0,
    deaths: 0
  });

  gameState.scoreboard.set(socket.id, 0);
  broadcastGameState();

  // Event Handlers
  socket.on("join-game", (playerData) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.name = playerData.name?.trim() || player.name;
      player.model = playerData.model || player.model;
      player.team = playerData.team || player.team;
      console.log(`${player.name} joined (${player.team} team)`);
      broadcastGameState();
    }
  });

  socket.on("player-move", (data) => {
    const player = gameState.players.get(socket.id);
    if (player && player.health > 0) {
      player.position = data.position;
      if (data.animation) player.animation = data.animation;
      if (data.weapon) player.weapon = data.weapon;
      broadcastGameState();
    }
  });

  socket.on("shoot", (data) => {
    const shooter = gameState.players.get(socket.id);
    if (!shooter || shooter.health <= 0) return;

    const bulletId = `${socket.id}-${Date.now()}`;
    gameState.bullets.set(bulletId, {
      id: bulletId,
      origin: data.origin,
      direction: data.direction,
      shooterId: socket.id,
      type: shooter.weapon,
      timestamp: Date.now()
    });

    // Bullet expiration
    setTimeout(() => {
      gameState.bullets.delete(bulletId);
      broadcastGameState();
    }, 1000);

    broadcastGameState();
  });

  socket.on("use-ability", (ability) => {
    const player = gameState.players.get(socket.id);
    if (!player || !CONFIG.ABILITIES[ability.toUpperCase()]) return;

    const now = Date.now();
    const abilityKey = `${socket.id}-${ability}`;
    const lastUsed = gameState.abilities.get(abilityKey) || 0;
    const cooldown = CONFIG.ABILITIES[ability.toUpperCase()].cooldown;

    if (now - lastUsed < cooldown) {
      socket.emit("ability-error", {
        ability,
        remaining: cooldown - (now - lastUsed)
      });
      return;
    }

    gameState.abilities.set(abilityKey, now);

    // Apply ability effects
    switch (ability.toLowerCase()) {
      case "heal":
        player.health = Math.min(
          CONFIG.PLAYER.MAX_HEALTH,
          player.health + CONFIG.ABILITIES.HEAL.amount
        );
        break;
      case "dash":
        // Dash logic would be handled client-side
        break;
      case "special":
        // Special ability logic
        break;
    }

    socket.emit("ability-used", { ability, timestamp: now });
    broadcastGameState();
  });

  socket.on("chat-message", (message) => {
    const player = gameState.players.get(socket.id);
    if (player && message?.text?.trim()) {
      const chatMessage = {
        sender: player.name,
        text: message.text.trim().substring(0, 200), // Limit message length
        timestamp: new Date().toISOString(),
        team: player.team
      };
      gameState.chatHistory.push(chatMessage);
      io.emit("chat-message", chatMessage);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameState.players.delete(socket.id);
    gameState.scoreboard.delete(socket.id);
    broadcastGameState();
  });
});

// Game Loop
setInterval(() => {
  // Check bullet collisions
  gameState.bullets.forEach((bullet, bulletId) => {
    const shooter = gameState.players.get(bullet.shooterId);
    if (!shooter) return;

    gameState.players.forEach((player, playerId) => {
      if (playerId === bullet.shooterId || player.health <= 0) return;

      // Simple collision detection
      const dx = player.position[0] - bullet.origin[0];
      const dy = player.position[1] - bullet.origin[1];
      const dz = player.position[2] - bullet.origin[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < CONFIG.PLAYER.HITBOX.RADIUS * 1.5) {
        const isHeadshot = dy > CONFIG.PLAYER.HITBOX.HEIGHT * 0.7;
        if (handlePlayerHit(bullet.shooterId, playerId, bullet.type, isHeadshot)) {
          gameState.bullets.delete(bulletId);
        }
      }
    });
  });

  // Update loot TTL
  gameState.loot.forEach((loot, lootId) => {
    loot.ttl -= 1;
    if (loot.ttl <= 0) {
      gameState.loot.delete(lootId);
    }
  });

  broadcastGameState();
}, 1000 / 30); // 30 FPS game loop

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  ███████╗ ██████╗ ██╗      ██████╗     ███████╗███████╗██████╗ ██╗   ██╗██╗██╗   ██╗ ██████╗ ██████╗ 
  ██╔════╝██╔═══██╗██║     ██╔═══██╗    ██╔════╝██╔════╝██╔══██╗██║   ██║██║██║   ██║██╔═══██╗██╔══██╗
  ███████╗██║   ██║██║     ██║   ██║    ███████╗█████╗  ██████╔╝██║   ██║██║██║   ██║██║   ██║██████╔╝
  ╚════██║██║   ██║██║     ██║   ██║    ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║╚██╗ ██╔╝██║   ██║██╔══██╗
  ███████║╚██████╔╝███████╗╚██████╔╝    ███████║███████╗██║  ██║ ╚████╔╝ ██║ ╚████╔╝ ╚██████╔╝██║  ██║
  ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝     ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝
  `);
  console.log(`🚀 Game server running on port ${PORT}`);
  console.log(`🎮 Game mode: ${gameState.gameMode}`);
  console.log(`🗺️ Current map: ${gameState.map}`);
});