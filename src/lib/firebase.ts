import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBvDnlsxhVX4yXvzbcDzDTD9pHie7mcuDA",
  authDomain: "taha-al-sabaag.firebaseapp.com",
  projectId: "taha-al-sabaag",
  storageBucket: "taha-al-sabaag.firebasestorage.app",
  messagingSenderId: "230783288790",
  appId: "1:230783288790:web:7e3aec5c948ad409c31077",
  measurementId: "G-R1GB3BN591"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services conditionally for client-side only
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = typeof window !== 'undefined' ? getAuth(app) : null;
export const db = typeof window !== 'undefined' ? getFirestore(app) : null;
export const storage = typeof window !== 'undefined' ? getStorage(app) : null;

export default app;