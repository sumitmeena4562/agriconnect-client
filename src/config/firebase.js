import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAqWgRDpUAzc6ZtoJiTt4MpdF5uS8IILfQ",
  authDomain: "agriconnect-09.firebaseapp.com",
  projectId: "agriconnect-09",
  // ⚠️  Realtime Database URL — Firebase Console se copy karo
  // Build → Realtime Database → URL copy karo
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  storageBucket: "agriconnect-09.firebasestorage.app",
  messagingSenderId: "787042420297",
  appId: "1:787042420297:web:10f3314b991ad002166198",
  measurementId: "G-8B3PXZ98F5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth     = getAuth(app);
export const database = getDatabase(app);   // Live GPS tracking ke liye
