"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-4 border-t border-gray-800">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-gray-400 text-sm">
          © {new Date().getFullYear()} MyBookLyst. All rights reserved.
        </div>
        <nav className="flex gap-6 text-sm">
          <Link 
            href="/privacy" 
            className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
} 