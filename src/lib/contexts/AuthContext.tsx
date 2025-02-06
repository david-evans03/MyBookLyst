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
  GoogleAuthProvider
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase/firebase';

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
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user?.email);
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
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      console.log('Initiating Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      console.error('Google sign-in error:', firebaseError);
      if (firebaseError instanceof FirebaseError) {
        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            throw new Error('Sign-in popup was closed before completing.');
          case 'auth/popup-blocked':
            throw new Error('Sign-in popup was blocked by the browser.');
          case 'auth/cancelled-popup-request':
            throw new Error('Another sign-in popup is already open.');
          default:
            throw new Error(`Authentication failed: ${firebaseError.message}`);
        }
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
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