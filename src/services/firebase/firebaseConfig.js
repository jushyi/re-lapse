import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

// Firebase configuration loaded from environment variables (.env file)
// SECURITY: Never commit .env file to Git - credentials are loaded at runtime
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase JS SDK
// Note: Authentication uses React Native Firebase (@react-native-firebase/auth)
// JS SDK is used only for Firestore and Storage
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Firebase JS SDK)
const db = getFirestore(app);

// Initialize Storage (Firebase JS SDK)
const storage = getStorage(app);

// Export Firebase services
export { app, db, storage };
