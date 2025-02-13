"use client";

import dynamic from 'next/dynamic';

const OnboardingWrapper = dynamic(() => import('./OnboardingWrapper'), {
  ssr: false
});

export default function ClientOnboardingWrapper() {
  return <OnboardingWrapper />;
} 