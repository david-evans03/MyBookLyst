"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { getDocument } from '@/lib/firebase/firebaseUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  uid: string;
  displayName: string;
  photoURL?: string;
}

interface FollowListModalProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowListModal({ userId, type, isOpen, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const followersRef = collection(db, "followers");
      const q = query(
        followersRef,
        where(type === 'followers' ? 'followedId' : 'followerId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const userPromises = querySnapshot.docs.map(async (doc) => {
        const targetUserId = type === 'followers' 
          ? doc.data().followerId 
          : doc.data().followedId;
        const userDoc = await getDocument("users", targetUserId);
        if (userDoc) {
          const userData = {
            uid: userDoc.id,
            displayName: userDoc.displayName || '',
            photoURL: userDoc.photoURL || '',
            email: userDoc.email || ''
          } as UserData;
          return userData;
        }
        return null;
      });

      const userList = await Promise.all(userPromises);
      setUsers(userList.filter(user => user !== null) as User[]);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <button
                key={user.uid}
                onClick={() => handleUserClick(user.uid)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                )}
                <span className="font-medium">{user.displayName}</span>
              </button>
            ))}
            {users.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No {type} yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 