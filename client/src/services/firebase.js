import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC0svjDruGHKADvxI__za9Qw1R0CIfMAG8",
  authDomain: "solo-survivor.firebaseapp.com",
  databaseURL: "https://solo-survivor-a0580-default-rtdb.firebaseio.com",
  projectId: "solo-survivor",
  storageBucket: "solo-survivor.appspot.com",
  messagingSenderId: "296738464811",
  appId: "1:1234567890:web:a0580123456789abcdef",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);