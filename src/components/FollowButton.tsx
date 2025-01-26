"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import React from 'react';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
  onFollowChange?: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, className, onFollowChange }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId, user]);

  const checkFollowStatus = async () => {
    if (!user || user.uid === targetUserId) return;

    try {
      const q = query(
        collection(db, "followers"),
        where("followerId", "==", user.uid),
        where("followedId", "==", targetUserId)
      );
      const querySnapshot = await getDocs(q);
      setIsFollowing(!querySnapshot.empty);
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || loading || user.uid === targetUserId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const q = query(
          collection(db, "followers"),
          where("followerId", "==", user.uid),
          where("followedId", "==", targetUserId)
        );
        const querySnapshot = await getDocs(q);
        const followDoc = querySnapshot.docs[0];
        await deleteDoc(followDoc.ref);
        setIsFollowing(false);
      } else {
        // Follow
        await addDoc(collection(db, "followers"), {
          followerId: user.uid,
          followedId: targetUserId,
          createdAt: new Date().toISOString()
        });
        setIsFollowing(true);
        if (!isFollowing) {
          // Create notification when following
          await addDoc(collection(db, "notifications"), {
            type: 'follow',
            userId: targetUserId,
            fromUserId: user.uid,
            fromUserName: user.displayName,
            fromUserPhoto: user.photoURL,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      }
      onFollowChange?.();
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.uid === targetUserId) return null;

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium ${
        isFollowing 
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 transition-colors ${className}`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton; 