"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show navbar on landing page or auth page
  if (pathname === '/' || pathname === '/auth') {
    return null;
  }

  return (
    <nav className="bg-gray-900/40 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-700/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/search"
            className="text-cyan-200 hover:text-cyan-400 transition-colors"
          >
            <Search size={24} />
          </Link>
          
          <Link 
            href="/books" 
            className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-cyan-200 hover:text-cyan-400 transition-colors title-glow"
          >
            MyBookLyst
          </Link>
          
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300"
              >
                <Image
                  src={user.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 py-2 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 animate-fadeIn">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-200 hover:bg-cyan-400/20 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-200 hover:bg-cyan-400/20 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-200 hover:bg-red-400/20 transition-colors flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 