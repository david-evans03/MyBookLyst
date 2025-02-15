"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase/firebase';
import { createOrUpdateUser, getUser } from '../firebase/firebaseUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider mounted');
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user?.email);
        if (user) {
          // Get existing user data first
          const existingUserData = await getUser(user.uid);
          
          // Create or update user document in Firestore
          await createOrUpdateUser({
            ...existingUserData, // Spread existing data to preserve it
            uid: user.uid,
            email: user.email || '',
            username: user.displayName || user.email?.split('@')[0] || '',
            photoURL: user.photoURL || '',
            // Only set these fields if user doesn't exist yet
            ...(existingUserData ? {} : {
              hasSeenTutorial: false,
              notifications: true,
              privacy: 'public'
            })
          });
        }
        setUser(user);
        setLoading(false);
      }, (error) => {
        console.error('Auth error:', error);
        setError(error.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Auth setup error:', err);
      setError(err instanceof Error ? err.message : 'Authentication setup failed');
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: username });
    // Create user document in Firestore
    await createOrUpdateUser({
      uid: user.uid,
      email: user.email || '',
      username: username,
      photoURL: user.photoURL || '',
      hasSeenTutorial: false,
      notifications: true,
      privacy: 'public'
    });
  };

  const signInWithGoogle = async () => {
    try {
      // Check specifically for TikTok's browser
      const isTikTokBrowser = /TikTok/i.test(navigator.userAgent);
      
      if (isTikTokBrowser) {
        throw new Error('TikTok browser is not supported for Google Sign-in. Please open this website in your default browser (Chrome, Safari, etc.) to sign in.');
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // For other mobile browsers, still use redirect
      const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('Initiating Google sign-in...', { isMobileBrowser });
      
      if (isMobileBrowser) {
        await signInWithRedirect(auth, provider);
        return;
      } else {
        const result = await signInWithPopup(auth, provider);
        if (result?.user) {
          console.log('Google sign-in successful:', result.user.email);
          
          // Get existing user data first
          const existingUserData = await getUser(result.user.uid);
          
          // Create or update user document in Firestore
          await createOrUpdateUser({
            ...existingUserData,
            uid: result.user.uid,
            email: result.user.email || '',
            username: result.user.displayName || result.user.email?.split('@')[0] || '',
            photoURL: result.user.photoURL || '',
            ...(existingUserData ? {} : {
              hasSeenTutorial: false,
              notifications: true,
              privacy: 'public'
            })
          });
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            throw new Error('Sign-in popup was closed before completing.');
          case 'auth/popup-blocked':
            throw new Error('Sign-in popup was blocked by the browser.');
          case 'auth/cancelled-popup-request':
            throw new Error('Another sign-in popup is already open.');
          default:
            throw error;
        }
      }
      throw error;
    }
  };

  // Add useEffect to handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Google redirect sign-in successful:', result.user.email);
          
          // Get existing user data first
          const existingUserData = await getUser(result.user.uid);
          
          // Create or update user document in Firestore
          await createOrUpdateUser({
            ...existingUserData,
            uid: result.user.uid,
            email: result.user.email || '',
            username: result.user.displayName || result.user.email?.split('@')[0] || '',
            photoURL: result.user.photoURL || '',
            ...(existingUserData ? {} : {
              hasSeenTutorial: false,
              notifications: true,
              privacy: 'public'
            })
          });
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    handleRedirectResult();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 