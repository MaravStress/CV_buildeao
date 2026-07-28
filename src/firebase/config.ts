import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Correo del administrador autorizado estrictamente
export const ADMIN_EMAIL = "eliamjesusparedes@gmail.com";

// Web app Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAqU4tTXx27LOg2N9qz_oU-fxWeljCFUu4",
  authDomain: "portafolios-data.firebaseapp.com",
  databaseURL: "https://portafolios-data-default-rtdb.firebaseio.com",
  projectId: "portafolios-data",
  storageBucket: "portafolios-data.firebasestorage.app",
  messagingSenderId: "509820224348",
  appId: "1:509820224348:web:5a2719d84da1d1ccc87799",
  measurementId: "G-G3SYN7ZMMJ"
};

// Initialize Firebase App (prevent re-initialization in HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = firebaseConfig.databaseURL ? getDatabase(app) : null; // Realtime Database
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Analytics instance (async safe for environments without window/analytics support)
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
