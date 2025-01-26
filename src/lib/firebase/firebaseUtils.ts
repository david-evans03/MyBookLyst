import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { checkAndUpdateQuota } from './rateLimits';

// Add this interface at the top of the file
interface FirestoreDocument {
  id: string;
  uid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  [key: string]: any; // For other potential fields
}

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists in Firestore
    const userDoc = await getDocument("users", result.user.uid);
    
    // If user document doesn't exist, create it
    if (!userDoc) {
      await addDocument("users", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notifications: true,
        privacy: 'public'
      }, result.user.uid);
    }
    
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export async function addDocument(collectionName: string, data: any, id?: string) {
  if (!await checkAndUpdateQuota('write')) {
    throw new Error('Daily write quota exceeded');
  }
  try {
    if (id) {
      // If an ID is provided, use setDoc to create/update the document with that ID
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, data);
      return { id, ...data };
    } else {
      // If no ID is provided, use addDoc to generate a random ID
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, data);
      return { id: docRef.id, ...data };
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = async (collection: string, documentId: string, data: any) => {
  const docRef = doc(db, collection, documentId);
  await updateDoc(docRef, data);
};

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

export async function getDocument(collection: string, id: string): Promise<FirestoreDocument | null> {
  if (!await checkAndUpdateQuota('read')) {
    throw new Error('Daily read quota exceeded');
  }
  const docRef = doc(db, collection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  return null;
}

// Storage functions
export async function uploadFile(file: File, path: string) {
  if (!await checkAndUpdateQuota('storage', file.size)) {
    throw new Error('Storage quota would be exceeded');
  }
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Add this new function
export const isDisplayNameTaken = async (displayName: string, currentUserId?: string) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("displayName", "==", displayName)
    );
    
    const querySnapshot = await getDocs(q);
    
    // If checking for a current user's update, exclude their own document
    if (currentUserId) {
      return querySnapshot.docs.some(doc => doc.id !== currentUserId);
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking display name:", error);
    throw error;
  }
};
