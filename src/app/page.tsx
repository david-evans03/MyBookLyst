"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ArrowRight, BookOpen, Users, Star } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#121214]">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <Link 
              href="/" 
              className="text-2xl font-bold text-cyan-200 hover:text-cyan-400 transition-colors title-glow"
            >
              MyBookLyst
            </Link>

            <div className="flex items-center gap-4">
              {!user && (
                <>
                  <Link 
                    href="/auth"
                    className="text-cyan-200 hover:text-cyan-400 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/auth"
                    className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 px-6 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {user && (
                <Link 
                  href="/books"
                  className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 px-6 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-cyan-200 title-glow">
            Track Your Reading Journey
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-400">
            Your personal book collection, beautifully organized and tracked in one place.
          </p>
          <div className="flex justify-center">
            <Link 
              href={user ? "/books" : "/auth"}
              className="btn-primary bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 px-12 py-4 rounded-lg text-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm group"
            >
              Start Your Lyst 
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="feature-card bg-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-700/30 hover:border-cyan-400/30 transition-all duration-300">
            <BookOpen className="w-12 h-12 text-cyan-300 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-cyan-200">Track Your Books</h3>
            <p className="text-gray-400">
              Keep track of your reading progress, create reading lists, and organize your book collection.
            </p>
          </div>
          
          <div className="feature-card bg-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-700/30 hover:border-cyan-400/30 transition-all duration-300">
            <Users className="w-12 h-12 text-cyan-300 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-cyan-200">Connect with Readers</h3>
            <p className="text-gray-400">
              Coming Soon...
            </p>
          </div>
          
          <div className="feature-card bg-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-700/30 hover:border-cyan-400/30 transition-all duration-300">
            <Star className="w-12 h-12 text-cyan-300 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-cyan-200">Rate & Review</h3>
            <p className="text-gray-400">
              Coming Soon...
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400">
        <p>© 2024 MyBookLyst. All rights reserved.</p>
      </footer>
    </div>
  );
}
