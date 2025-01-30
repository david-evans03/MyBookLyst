"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

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
            <Link 
              href="/profile" 
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300"
            >
              <img
                src={user.photoURL || 'https://via.placeholder.com/40?text=U'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 