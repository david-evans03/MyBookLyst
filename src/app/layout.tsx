import { AuthProvider } from '@/lib/contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'MyBookLyst',
  description: 'Track and manage your reading list',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-light" />
        <AuthProvider>
          <Navbar />
          <main className="pt-24 min-h-screen">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-cyan-200">Loading...</div>
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
} 