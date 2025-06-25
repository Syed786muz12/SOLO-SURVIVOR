import { rtdb } from './firebase';
import { ref, set, get, update, remove, onDisconnect } from 'firebase/database';
import axios from 'axios';

const USERS_PATH = 'players/';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export class FirebaseUserService {
  // Generate a unique player ID
  static generatePlayerId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `USR-${timestamp}-${randomStr}`;
  }

  // Create new user profile
  static async createProfile(uid, profileData = {}) {
    if (!uid) throw new Error('User ID is required');
    const defaultProfile = {
      email: profileData.email || '',
      name: profileData.name || 'Unnamed Player',
      avatar: profileData.avatar || '/assets/avatar.webp',
      xp: 0,
      level: 1,
      status: 'online',
      character: '/assets/character.glb',
      background: '/assets/bg-dashboard.jpg',
      equippedWeapon: 'rifle',
      ownedItems: [],
      friends: [],
      requestsSent: [],
      requestsReceived: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      ...profileData,
    };
    await set(ref(rtdb, USERS_PATH + uid), defaultProfile);
    return defaultProfile;
  }

  // Get user profile
  static async getProfile(uid) {
    if (!uid) throw new Error('User ID is required');
    const snapshot = await get(ref(rtdb, USERS_PATH + uid));
    return snapshot.exists() ? snapshot.val() : null;
  }

  // Update profile fields
  static async updateProfile(uid, updates) {
    if (!uid || typeof updates !== 'object') throw new Error('Invalid update');
    const updatesWithTimestamp = {
      ...updates,
      lastActive: new Date().toISOString(),
    };
    await update(ref(rtdb, USERS_PATH + uid), updatesWithTimestamp);
    return await this.getProfile(uid);
  }

  // Check if profile exists
  static async checkExists(uid) {
    if (!uid) return false;
    const snapshot = await get(ref(rtdb, USERS_PATH + uid));
    return snapshot.exists();
  }

  // Send friend request
  static async sendFriendRequest(fromUid, toUid) {
    if (!fromUid || !toUid || fromUid === toUid) throw new Error('Invalid user IDs');

    const [fromExists, toExists] = await Promise.all([
      this.checkExists(fromUid),
      this.checkExists(toUid),
    ]);
    if (!fromExists || !toExists) throw new Error('One or both users not found');

    const [fromRequests, toRequests, fromFriends] = await Promise.all([
      this.getArray(fromUid, 'requestsSent'),
      this.getArray(toUid, 'requestsReceived'),
      this.getArray(fromUid, 'friends'),
    ]);

    if (fromRequests.includes(toUid)) throw new Error('Already sent');
    if (fromFriends.includes(toUid)) throw new Error('Already friends');

    await Promise.all([
      update(ref(rtdb, USERS_PATH + fromUid), {
        requestsSent: [...fromRequests, toUid],
      }),
      update(ref(rtdb, USERS_PATH + toUid), {
        requestsReceived: [...toRequests, fromUid],
      }),
    ]);
  }

  // Accept friend request
  static async acceptFriendRequest(currentUid, fromUid) {
    const [currentUser, fromUser] = await Promise.all([
      this.getProfile(currentUid),
      this.getProfile(fromUid),
    ]);
    if (!currentUser?.requestsReceived?.includes(fromUid)) {
      throw new Error('No incoming request found');
    }

    await Promise.all([
      update(ref(rtdb, USERS_PATH + currentUid), {
        friends: [...(currentUser.friends || []), fromUid],
        requestsReceived: currentUser.requestsReceived.filter(id => id !== fromUid),
      }),
      update(ref(rtdb, USERS_PATH + fromUid), {
        friends: [...(fromUser.friends || []), currentUid],
        requestsSent: fromUser.requestsSent.filter(id => id !== currentUid),
      }),
    ]);
  }

  // Reject friend request
  static async rejectFriendRequest(currentUid, fromUid) {
    const [currentUser, fromUser] = await Promise.all([
      this.getProfile(currentUid),
      this.getProfile(fromUid),
    ]);

    await Promise.all([
      update(ref(rtdb, USERS_PATH + currentUid), {
        requestsReceived: currentUser.requestsReceived.filter(id => id !== fromUid),
      }),
      update(ref(rtdb, USERS_PATH + fromUid), {
        requestsSent: fromUser.requestsSent.filter(id => id !== currentUid),
      }),
    ]);
  }

  // Remove friend
  static async removeFriend(currentUid, friendUid) {
    const [currentUser, friendUser] = await Promise.all([
      this.getProfile(currentUid),
      this.getProfile(friendUid),
    ]);

    await Promise.all([
      update(ref(rtdb, USERS_PATH + currentUid), {
        friends: currentUser.friends.filter(id => id !== friendUid),
      }),
      update(ref(rtdb, USERS_PATH + friendUid), {
        friends: friendUser.friends.filter(id => id !== currentUid),
      }),
    ]);
  }

  // Set online status and ensure offline on disconnect
  static async setOnlineStatus(uid) {
    const statusRef = ref(rtdb, `${USERS_PATH}${uid}/status`);
    const lastActiveRef = ref(rtdb, `${USERS_PATH}${uid}/lastActive`);
    await set(statusRef, 'online');
    await set(lastActiveRef, new Date().toISOString());

    onDisconnect(statusRef).set('offline');
    onDisconnect(lastActiveRef).set(new Date().toISOString());
  }

  // Sync user with backend API
  static async syncWithBackend(user) {
    if (!user?.uid) throw new Error('Invalid user');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/sync`, {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || 'Unnamed Player',
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Backend sync successful:', response.data);
    } catch (error) {
      console.warn('Backend sync failed:', error.message);
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') return;
      throw error;
    }
  }

  // Get array field from profile (helper)
  static async getArray(uid, field) {
    try {
      const profile = await this.getProfile(uid);
      return Array.isArray(profile?.[field]) ? profile[field] : [];
    } catch {
      return [];
    }
  }

  // Add XP and level up if necessary
  static async addXP(uid, xpAmount) {
    if (!uid || typeof xpAmount !== 'number' || xpAmount < 0) {
      throw new Error('Valid XP amount and UID required');
    }

    const profile = await this.getProfile(uid);
    const newXP = (profile.xp || 0) + xpAmount;
    const newLevel = Math.floor(newXP / 1000) + 1;

    return await this.updateProfile(uid, {
      xp: newXP,
      level: Math.max(newLevel, profile.level || 1),
    });
  }

  // Delete entire profile
  static async deleteProfile(uid) {
    if (!uid) throw new Error('UID required');
    await remove(ref(rtdb, USERS_PATH + uid));
  }
}
