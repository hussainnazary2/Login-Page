'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { getAuthState } from '@/lib/auth';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';

type LoadingState = 'checking' | 'redirecting' | 'ready';
type ErrorState = 'auth_failed' | 'storage_error' | 'redirect_error' | null;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('checking');
  const [error, setError] = useState<ErrorState>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkAuthentication = useCallback(async () => {
    try {
      setLoadingState('checking');
      setError(null);

      // Small delay to prevent flash
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check authentication state
      const authState = getAuthState();
      
      if (!authState.isAuthenticated || !authState.user) {
        setLoadingState('redirecting');
        
        // Delay to show redirecting message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          router.push('/');
        } catch (_redirectError) {
          setError('redirect_error');
          setLoadingState('ready');
        }
        return;
      }

      // Validate user data structure
      if (!authState.user.name || !authState.user.email || !authState.user.picture) {
        setError('storage_error');
        setLoadingState('ready');
        return;
      }

      // Set user data if authenticated and valid
      setUser(authState.user);
      setLoadingState('ready');
    } catch (_err) {
      setError('auth_failed');
      setLoadingState('ready');
    }
  }, [router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    checkAuthentication();
  };

  const handleForceLogin = () => {
    try {
      router.push('/');
    } catch {
      window.location.href = '/';
    }
  };

  // Show loading state while checking authentication
  if (loadingState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Checking authentication...</p>
          <div className="sr-only" aria-live="polite">
            Please wait while we verify your login status
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (loadingState === 'redirecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Redirecting to login...</p>
          <div className="sr-only" aria-live="polite">
            You are not logged in. Redirecting to the login page.
          </div>
        </div>
      </div>
    );
  }

  // Show error states
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {error === 'auth_failed' && 'Authentication Error'}
              {error === 'storage_error' && 'Data Error'}
              {error === 'redirect_error' && 'Navigation Error'}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4" role="alert">
              {error === 'auth_failed' && 'Unable to verify your login status. This may be due to browser settings or corrupted session data.'}
              {error === 'storage_error' && 'Your login data appears to be corrupted or incomplete. Please log in again.'}
              {error === 'redirect_error' && 'Unable to redirect to the login page. Please navigate manually.'}
            </p>

            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mb-4">
                Retry attempt: {retryCount}
              </p>
            )}

            <div className="space-y-2">
              {retryCount < 3 && (
                <Button
                  onClick={handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={handleForceLogin}
                variant="outline"
                className="w-full"
              >
                Go to Login Page
              </Button>

              {retryCount >= 3 && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  Refresh Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is null (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <DashboardHeader user={user} />
      
      {/* Main Content */}
      <main 
        className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
        role="main"
        aria-label="Dashboard main content"
      >
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 sm:p-6 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src={user.picture.large}
              alt={`${user.name.first} ${user.name.last}'s profile picture`}
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-gray-200 mx-auto sm:mx-0 flex-shrink-0"
            />
            <div className="text-center sm:text-left min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2 sm:text-2xl lg:text-3xl">
                {user.name.first} {user.name.last}
              </h2>
              <p className="text-gray-600 mb-1 text-sm sm:text-base break-all">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-500 sm:text-base">
                Welcome to your dashboard! You are successfully logged in.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3 sm:text-lg sm:mb-4">
              Profile Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 sm:text-base">First Name:</span>
                <p className="text-gray-900 text-sm sm:text-base">{user.name.first}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 sm:text-base">Last Name:</span>
                <p className="text-gray-900 text-sm sm:text-base">{user.name.last}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 sm:text-base">Email:</span>
                <p className="text-gray-900 break-all text-sm sm:text-base">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Session Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3 sm:text-lg sm:mb-4">
              Session Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 sm:text-base">Status:</span>
                <p className="text-green-600 font-medium text-sm sm:text-base">Authenticated</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 sm:text-base">Login Time:</span>
                <p className="text-gray-900 text-sm sm:text-base">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base font-semibold text-gray-900 mb-3 sm:text-lg sm:mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 sm:text-base">
                Your authentication session is active. You can safely navigate within the application.
              </p>
              <p className="text-sm text-gray-600 sm:text-base">
                Use the logout button in the header when you&apos;re ready to end your session.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}