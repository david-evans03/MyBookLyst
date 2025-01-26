"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import LoginForm from "./LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientHome() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/booklist');
    }
  }, [user, router]);

  if (!user) {
    return <LoginForm />;
  }

  return null; // Will redirect to /booklist if logged in
}