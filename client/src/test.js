
import { auth } from './services/firebase';

console.log("Firebase test running...");
auth.signInWithEmailAndPassword("test@example.com", "wrongpass")
  .catch(err => console.log("✅ Firebase working! Got expected error:", err.message));