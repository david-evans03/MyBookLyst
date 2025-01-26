'use client';

import React, { useContext } from 'react';
import { AuthContext } from "@/lib/contexts/AuthContext";
import { auth } from "@/lib/firebase/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getDocument, addDocument } from "@/lib/firebase/firebaseUtils";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useAuthWithEmail = () => {
  const context = useAuth();

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user document exists, if not create it
      const userDoc = await getDocument("users", result.user.uid);
      if (!userDoc) {
        await addDocument("users", {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || email.split('@')[0], // Use email prefix as fallback
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notifications: true,
          privacy: 'public'
        }, result.user.uid);
      }
      
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return {
    ...context,
    signInWithEmail,
    signUpWithEmail,
  };
};