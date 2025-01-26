"use client";

import Link from 'next/link';
import UserDropdown from './UserDropdown';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const isSearchPage = pathname === '/search';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#1a1a1a] border-b border-[#3a3a3a] z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Search */}
          <div className="w-48">
            <button
              onClick={() => router.push('/search')}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isSearchPage || isHovered
                  ? 'bg-[#2a2a2a] ring-2 ring-blue-400'
                  : 'hover:bg-[#2a2a2a]'
              }`}
            >
              <Search className={`w-5 h-5 ${
                isSearchPage || isHovered ? 'text-blue-400' : 'text-gray-400'
              }`} />
            </button>
          </div>
          
          {/* Center section - Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/booklist" className="text-blue-400 text-xl font-semibold">
              MyBookList
            </Link>
          </div>
          
          {/* Right section - User */}
          <div className="w-48 flex justify-end items-center">
            <UserDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
} 