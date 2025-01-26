"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateDocument, addDocument, getDocument, isDisplayNameTaken } from "@/lib/firebase/firebaseUtils";
import { updateProfile } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebase';
import { User, Upload } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    email: '',
    notifications: true,
    privacy: 'public'
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Get the user document reference
      const userDoc = await getDocument("users", user.uid);
      
      const userData = {
        email: user.email,
        notifications: formData.notifications,
        privacy: formData.privacy,
        updatedAt: new Date().toISOString()
      };

      if (!userDoc) {
        // If user document doesn't exist, create it
        await addDocument("users", {
          ...userData,
          uid: user.uid,
          createdAt: new Date().toISOString()
        }, user.uid);
      } else {
        // If it exists, update it
        await updateDocument("users", user.uid, userData);
      }

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile
      await updateProfile(user, {
        photoURL: downloadURL
      });

      // Force refresh to show new image
      window.location.reload();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div>Please sign in to access settings.</div>;
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto pt-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Settings</h1>
        
        <div className="space-y-8">
          <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Profile Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              {/* Commented out theme selection
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              */}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
                </label>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-200 mb-2">
                  Privacy
                </label>
                <select
                  value={formData.privacy}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Notification Settings</h2>
            {/* Notification settings */}
          </div>

          <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Profile Picture</h2>
            
            <div className="flex items-center gap-6">
              {/* Current Profile Picture */}
              <div className="relative">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#374151]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#2a2a2a] border-2 border-[#374151] flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-100 
                    rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload New Picture'}
                </button>
                
                {error && (
                  <p className="mt-2 text-red-400 text-sm">{error}</p>
                )}
                
                <p className="mt-2 text-gray-400 text-sm">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 mt-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
} 