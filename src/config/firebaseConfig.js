import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyADeG5Gu0vtNJU_Yllcq-Yp0Yek_038t7I",
  authDomain: "nutri-veda-6553f.firebaseapp.com",
  projectId: "nutri-veda-6553f",
  storageBucket: "nutri-veda-6553f.firebasestorage.app",
  messagingSenderId: "226012081595",
  appId: "1:226012081595:web:1a912e78c7b2a94028a89e",
  measurementId: "G-Z60BX6JBHQ"
};

// Initialize Firebase - check if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication with AsyncStorage persistence for React Native
// Check if auth is already initialized
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
export const db = getFirestore(app);
export { auth };
export default app;
