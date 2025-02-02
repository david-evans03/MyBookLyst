"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebase';
import Image from 'next/image';
import { Camera } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setError('');

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user's profile
      await updateProfile(user, {
        photoURL: downloadURL
      });

      // Force a reload to update the navbar image
      window.location.reload();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-cyan-200 mb-8">Settings</h1>
      
      <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
        <h2 className="text-xl font-bold text-cyan-200 mb-6">Profile Picture</h2>
        
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-700/50">
              <Image
                src={user?.photoURL || '/default-avatar.png'}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-gray-900/90 rounded-full border border-gray-700/50 
                hover:border-cyan-400/50 transition-all duration-300"
            >
              <Camera className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <p className="text-gray-400 text-sm text-center">
            Click the camera icon to upload a new profile picture.<br />
            Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>
    </div>
  );
} 