import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";

const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;
const RECONNECTION_DELAY_MAX = 5000;
const PING_TIMEOUT = 10000;
const PING_INTERVAL = 25000;

const DEBUG = process.env.NODE_ENV === "development";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionPromise = null;
    this.initialize();
  }

  initialize() {
    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionDelayMax: RECONNECTION_DELAY_MAX,
      timeout: PING_TIMEOUT,
      pingInterval: PING_INTERVAL,
      query: {
        clientType: "web",
      },
    });

    if (DEBUG) this.setupDebugging();
  }

  setupDebugging() {
    const events = [
      "connect", "disconnect", "reconnect_attempt", "reconnect_failed",
      "connect_error", "error", "ping", "pong"
    ];

    events.forEach((event) => {
      this.socket.on(event, (...args) => {
        console.log(`[Socket][${event}]`, ...args);
      });
    });

    // Override emit to log
    const originalEmit = this.socket.emit.bind(this.socket);
    this.socket.emit = (event, ...args) => {
      console.groupCollapsed(`⬆️ Emitting: "${event}"`);
      console.log("Payload:", args);
      console.groupEnd();
      return originalEmit(event, ...args);
    };
  }

  async connect() {
    if (this.isConnected) return true;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Socket connection timeout"));
      }, PING_TIMEOUT);

      const onConnect = () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.socket.off("connect_error", onError);
        resolve(true);
      };

      const onError = (err) => {
        clearTimeout(timeout);
        this.socket.off("connect", onConnect);
        reject(err);
      };

      this.socket.once("connect", onConnect);
      this.socket.once("connect_error", onError);
      this.socket.connect();
    });

    try {
      await this.connectionPromise;
      return true;
    } catch (err) {
      console.error("🔌 Socket connection failed:", err.message);
      throw err;
    } finally {
      this.connectionPromise = null;
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  async authenticate(token, metadata = {}) {
    if (!this.socket) throw new Error("Socket not initialized");

    this.socket.auth = { token, ...metadata };
    return this.connect();
  }

  emit(event, data = {}) {
    if (!this.isConnected) {
      console.warn(`❌ Emit skipped – socket not connected [${event}]`);
      return;
    }
    this.socket.emit(event, data);
  }

  async emitWithAck(event, data, timeout = 5000) {
    if (!this.isConnected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`⏱️ Ack timeout: ${event}`));
      }, timeout);

      this.socket.emit(event, data, (response) => {
        clearTimeout(timer);
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response?.data ?? response);
        }
      });
    });
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  get id() {
    return this.socket?.id || null;
  }

  get status() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

export const socketService = new SocketService();
