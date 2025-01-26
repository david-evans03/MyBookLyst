import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useContext } from 'react';
import { AuthContext } from "../contexts/AuthContext";
import { isDisplayNameTaken } from "../firebase/firebaseUtils";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user, loading } = context;
  const [needsUsername, setNeedsUsername] = useState(false);

  // Add email sign in method
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  // Add email sign up method
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user has a username
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().username) {
        // Create initial user document without username
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notifications: true,
          privacy: 'public'
        });
        setNeedsUsername(true);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const completeUsernameSetup = () => {
    setNeedsUsername(false);
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut: () => auth.signOut(),
    needsUsername,
    completeUsernameSetup,
  };
} 