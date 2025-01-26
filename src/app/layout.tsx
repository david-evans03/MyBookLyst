"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/hooks/useAuth";
import UsernamePrompt from "@/components/UsernamePrompt";
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ["latin"] });

// Create a new component to use the auth hook
function AppContent({ children }: { children: React.ReactNode }) {
  const { user, needsUsername, completeUsernameSetup, loading } = useAuth();

  // Don't render anything while checking auth state
  if (loading) {
    return <div className="min-h-screen bg-[#1a1a1a]"></div>;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {user && <Navbar />}
      <main className={user ? "pt-16" : ""}>
        {needsUsername && user && (
          <UsernamePrompt
            user={user}
            onComplete={completeUsernameSetup}
          />
        )}
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ErrorBoundary>
            <AppContent>{children}</AppContent>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
