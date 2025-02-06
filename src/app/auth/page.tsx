"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (user) {
        window.location.href = '/books';
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-200">Loading...</div>
      </div>
    );
  }

  // Don't render anything if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center">
      <div className="container py-8">
        <div className="max-w-md mx-auto bg-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-700/30">
          <h1 className="text-2xl font-bold mb-6 text-cyan-200 text-center">
            {isSignIn ? 'Sign In' : 'Create Account'}
          </h1>
          {isSignIn ? <SignInForm /> : <SignUpForm />}
          <p className="text-center mt-4 text-gray-400">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-cyan-200 hover:text-cyan-400 transition-colors"
            >
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 