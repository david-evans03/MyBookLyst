"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/books');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary w-full mb-4">
          Sign In
        </button>
      </form>
      <button
        onClick={() => signInWithGoogle()}
        className="btn w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 py-2"
      >
        <Image
          src="/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        Sign in with Google
      </button>
    </div>
  );
} 