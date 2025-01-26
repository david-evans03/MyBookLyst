"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { User, Settings, LogOut, Bell, BookPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Add admin check
  const ADMIN_UIDS = ['pUGokLEstmegrdcWxETR6KSJEKt1'];
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-[#3a3a3a]" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#2a2a2a] ring-2 ring-[#3a3a3a] flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] rounded-lg shadow-xl border border-[#3a3a3a]">
          <div className="py-1">
            {/* Add Admin Link for admin users */}
            {isAdmin && (
              <Link
                href="/admin/books"
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-blue-400"
              >
                <BookPlus className="w-4 h-4" />
                Book Approval
              </Link>
            )}
            <Link
              href="/notifications"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-blue-400"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Link>
            <Link
              href={`/profile/${user?.uid}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-blue-400"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-blue-400"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 