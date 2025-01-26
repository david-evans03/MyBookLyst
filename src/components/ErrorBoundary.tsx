"use client";

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.error?.message.includes('quota exceeded')) {
        return (
          <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
            <div className="bg-[#2a2a2a] p-6 rounded-lg max-w-md text-center">
              <h2 className="text-xl text-red-400 mb-4">Service Temporarily Unavailable</h2>
              <p className="text-gray-300">
                We've reached our daily usage limit. Please try again tomorrow.
              </p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="bg-[#2a2a2a] p-6 rounded-lg">
            <h2 className="text-xl text-red-400">Something went wrong</h2>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 