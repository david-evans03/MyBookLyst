"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import { useState } from 'react';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/books');
    }
  }, [user, router]);

  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto">
        {isSignIn ? <SignInForm /> : <SignUpForm />}
        <p className="text-center mt-4">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-primary hover:underline"
          >
            {isSignIn ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
} 