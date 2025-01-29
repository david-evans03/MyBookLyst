import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  oauth_client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
  oauth_client_secret: process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Add error handling for auth initialization
auth.useDeviceLanguage(); // Set language to user's device language

console.log('Firebase initialized with config:', {
  apiKey: firebaseConfig.apiKey ? 'exists' : 'missing',
  authDomain: firebaseConfig.authDomain ? 'exists' : 'missing',
  projectId: firebaseConfig.projectId ? 'exists' : 'missing',
  // Add other config checks as needed
});

export { app, auth, db, storage }; 