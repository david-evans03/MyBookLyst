"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

const SignOutButton = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="absolute top-0 right-4 z-40 flex items-center gap-2 px-4 py-2 
        bg-gray-900/40 hover:bg-red-400/20 text-gray-200 hover:text-red-200 
        rounded-lg transition-all duration-300 backdrop-blur-sm border border-gray-700/30 
        hover:border-red-400/30"
    >
      <LogOut size={16} />
      <span>Sign Out</span>
    </button>
  );
};

export default SignOutButton; 