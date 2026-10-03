import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

/**
 * ============================================================================
 * FIREBASE CONFIGURATION INSTRUCTIONS
 * ============================================================================
 * 
 * To connect your Firebase project:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Select or create your project.
 * 3. Go to "Project Settings" (gear icon) > "General" tab.
 * 4. Under "Your apps", click the Web icon (</>) to register a web app.
 * 5. Copy the `firebaseConfig` credentials object and paste the values below,
 *    OR add them to your environment variables (e.g., .env or VITE_FIREBASE_*).
 * 6. Under "Authentication" in Firebase Console:
 *    - Click "Get Started"
 *    - In "Sign-in method" tab, enable "Email/Password" and save.
 * ============================================================================
 */

export const firebaseConfig = {
  apiKey: "AIzaSyDID8wfVqmK19MZve8L8Ak6oVrpS_4h_5U",
  authDomain: "rent-and-reuse.firebaseapp.com",
  projectId: "rent-and-reuse",
  storageBucket: "rent-and-reuse.firebasestorage.app",
  messagingSenderId: "301227593157",
  appId: "1:301227593157:web:b5d11f530cec2b8ae30fac"
};

// Check if credentials have been replaced with real project keys
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes('Placeholder') &&
    !firebaseConfig.apiKey.includes('YOUR_API_KEY')
  );
};

// Safe initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
  // Firestore exports
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  runTransaction,
  serverTimestamp,
};
