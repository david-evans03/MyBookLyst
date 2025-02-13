"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createOrUpdateUser } from '@/lib/firebase/firebaseUtils';
import { Search, BookOpen, User2 } from 'lucide-react';

interface OnboardingSlide {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const slides: OnboardingSlide[] = [
  {
    title: "Welcome to MyBookLyst!",
    description: "Thank you for joining our community of book lovers. Let's take a quick tour of the features available to you.",
  },
  {
    title: "Search Books",
    description: "Click the search icon in the top left corner to find and add books to your collection.",
    icon: <Search className="w-8 h-8 text-cyan-200" />
  },
  {
    title: "Your Book List",
    description: "Access your book collection by clicking 'MyBookLyst' in the center of the navigation bar.",
    icon: <BookOpen className="w-8 h-8 text-cyan-200" />
  },
  {
    title: "Profile & Settings",
    description: "Click your profile picture to access analytics, settings, and sign out options.",
    icon: <User2 className="w-8 h-8 text-cyan-200" />
  }
];

const OnboardingTutorial = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    setIsVisible(false);
    if (user) {
      await createOrUpdateUser({
        uid: user.uid,
        hasSeenTutorial: true
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-6">
          {slides[currentSlide].icon && (
            <div className="mb-2">
              {slides[currentSlide].icon}
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-cyan-200">
            {slides[currentSlide].title}
          </h2>
          
          <p className="text-gray-300">
            {slides[currentSlide].description}
          </p>

          <div className="flex justify-center space-x-2 mt-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            {currentSlide < slides.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 
                  rounded-lg transition-all duration-300"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 
                  rounded-lg transition-all duration-300"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial; 