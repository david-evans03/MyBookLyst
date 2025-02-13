"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUser } from '@/lib/firebase/firebaseUtils';
import OnboardingTutorial from './OnboardingTutorial';

const OnboardingWrapper = () => {
  const { user } = useAuth();
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (user) {
        const userData = await getUser(user.uid);
        if (userData && !userData.hasSeenTutorial) {
          setShouldShowTutorial(true);
        }
      }
    };

    checkTutorialStatus();
  }, [user]);

  if (!shouldShowTutorial) return null;

  return <OnboardingTutorial />;
};

export default OnboardingWrapper; 