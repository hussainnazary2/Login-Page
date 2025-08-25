'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authCheckError, setAuthCheckError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Small delay to prevent flash
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user is already authenticated
        if (isAuthenticated()) {
          router.push('/dashboard');
          return;
        }
        
        setIsCheckingAuth(false);
      } catch (_error) {
        setAuthCheckError('Unable to check authentication status. Please refresh the page.');
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
          <div className="sr-only" aria-live="polite">
            Please wait while we check your login status
          </div>
        </div>
      </div>
    );
  }

  // Show auth check error
  if (authCheckError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-red-600 mb-4" role="alert">
              {authCheckError}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Sign in to your account using your mobile number
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-sm rounded-lg sm:py-8 sm:px-10 border border-gray-200">
          <LoginForm />
        </div>
      </div>

      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-xs text-gray-500 sm:text-sm">
          Enter your Iranian mobile number to continue
        </p>
      </div>
    </div>
  );
}
