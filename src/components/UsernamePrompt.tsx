"use client";

import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { isDisplayNameTaken } from '@/lib/firebase/firebaseUtils';

interface UsernamePromptProps {
  user: any;
  onComplete: () => void;
}

export default function UsernamePrompt({ user, onComplete }: UsernamePromptProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate username
      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (username.length > 20) {
        throw new Error('Username must be less than 20 characters');
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }

      // Check if username is taken
      const isTaken = await isDisplayNameTaken(username);
      if (isTaken) {
        throw new Error('This username is already taken');
      }

      // Update auth profile
      await updateProfile(user, {
        displayName: username
      });

      // Update Firestore document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: username,
        username: username.toLowerCase(), // Store lowercase version for case-insensitive search
        updatedAt: new Date().toISOString()
      });

      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Choose Your Username</h2>
        <p className="text-gray-400 mb-4">
          Please choose a unique username for your account.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg 
                text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Setting username...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
} 