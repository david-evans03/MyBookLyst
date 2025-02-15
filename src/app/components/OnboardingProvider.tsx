"use client";

import dynamic from 'next/dynamic';

const OnboardingTutorial = dynamic(() => import('./OnboardingTutorial'), {
  ssr: false
});

export default function OnboardingProvider() {
  return <OnboardingTutorial />;
} 