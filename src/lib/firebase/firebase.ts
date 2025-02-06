import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if any config values are missing
const missingValues = Object.entries(firebaseConfig).filter(([_, value]) => !value);
if (missingValues.length > 0) {
  console.error('Missing Firebase configuration values:', missingValues.map(([key]) => key));
  throw new Error('Firebase configuration is incomplete. Check your environment variables.');
}

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw error;
}

let auth: Auth;
try {
  auth = getAuth(app);
  auth.useDeviceLanguage();
  console.log('Firebase auth initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase auth:', error);
  throw error;
}

const db = getFirestore(app);
const storage = getStorage(app);

// Log full config for debugging (without sensitive values)
console.log('Firebase configuration:', {
  apiKey: firebaseConfig.apiKey ? 'exists' : 'missing',
  authDomain: firebaseConfig.authDomain ? 'exists' : 'missing',
  projectId: firebaseConfig.projectId ? 'exists' : 'missing',
  storageBucket: firebaseConfig.storageBucket ? 'exists' : 'missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'exists' : 'missing',
  appId: firebaseConfig.appId ? 'exists' : 'missing'
});

export { app, auth, db, storage }; 