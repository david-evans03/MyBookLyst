import { AuthProvider } from '@/lib/contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import './globals.css';
import type { Metadata } from 'next';

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
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
} 