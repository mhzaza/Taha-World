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
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;