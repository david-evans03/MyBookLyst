import { AuthProvider } from '@/lib/contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'MyBookLyst',
  description: 'Track and manage your reading list',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/images/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/images/icon.png',
        type: 'image/png',
        sizes: '32x32',
      }
    ],
    apple: {
      url: '/images/apple-touch-icon.png',
      sizes: '180x180',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
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