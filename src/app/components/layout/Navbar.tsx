"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on auth page
  if (pathname === '/auth') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/books" 
            className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            MyBookLyst
          </Link>
          
          {user && (
            <Link 
              href="/profile" 
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors"
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