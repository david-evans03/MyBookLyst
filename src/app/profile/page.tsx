"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      <h1 className="text-3xl font-bold mb-8 text-cyan-200 title-glow text-center">Profile</h1>
      <p className="text-gray-600">This page is under construction.</p>
    </div>
  );
} 