'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateIranianPhone } from '@/lib/validation';
import { fetchRandomUser, ApiError } from '@/lib/api';
import { saveUserToStorage } from '@/lib/auth';
import { cn } from '@/lib/utils';

type ErrorType = 'validation' | 'network' | 'api' | 'storage' | 'redirect' | 'general';

interface ErrorState {
  message: string;
  type: ErrorType;
  retryable: boolean;
}

export function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const setErrorState = (message: string, type: ErrorType, retryable: boolean = false) => {
    setError({ message, type, retryable });
  };

  const clearError = () => {
    setError(null);
    setRetryCount(0);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    if (!phoneNumber.trim()) {
      setErrorState('Mobile number is required. Please enter your Iranian mobile number.', 'validation');
      return false;
    }

    if (!validateIranianPhone(phoneNumber)) {
      setErrorState(
        'Please enter a valid Iranian mobile number. Accepted formats: 09xxxxxxxxx, +989xxxxxxxxx, or 00989xxxxxxxxx',
        'validation'
      );
      return false;
    }

    return true;
  };

  const handleRetry = () => {
    if (error?.retryable) {
      clearError();
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any existing errors
    clearError();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Fetch user data from RandomUser API
      const userData = await fetchRandomUser();
      
      // Save user data to localStorage
      try {
        saveUserToStorage(userData);
      } catch (_storageError) {
        setErrorState(
          'Unable to save login information. Please check your browser settings and try again.',
          'storage',
          true
        );
        return;
      }
      
      // Set redirecting state for better UX
      setIsRedirecting(true);
      
      // Redirect to dashboard
      try {
        router.push('/dashboard');
      } catch (_redirectError) {
        setErrorState(
          'Login successful but unable to redirect. Please refresh the page.',
          'redirect',
          true
        );
        setIsRedirecting(false);
      }
    } catch (err) {
      const currentRetry = retryCount + 1;
      setRetryCount(currentRetry);

      if (err instanceof ApiError) {
        // Handle different types of API errors with specific messages
        if (err.message.includes('timeout')) {
          setErrorState(
            'Request timed out. Please check your internet connection and try again.',
            'network',
            true
          );
        } else if (err.message.includes('Network error')) {
          setErrorState(
            'Unable to connect to the server. Please check your internet connection and try again.',
            'network',
            true
          );
        } else if (err.status && err.status >= 500) {
          setErrorState(
            'Server is temporarily unavailable. Please try again in a few moments.',
            'api',
            true
          );
        } else if (err.status && err.status >= 400) {
          setErrorState(
            'There was a problem with your request. Please try again.',
            'api',
            true
          );
        } else {
          setErrorState(err.message, 'api', true);
        }
      } else {
        setErrorState(
          'An unexpected error occurred. Please try again or contact support if the problem persists.',
          'general',
          true
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLoadingMessage = () => {
    if (isRedirecting) return 'Redirecting to dashboard...';
    if (isLoading) return 'Logging in...';
    return 'Login';
  };

  const getAriaLiveMessage = () => {
    if (isRedirecting) return 'Login successful, redirecting to dashboard...';
    if (isLoading) return 'Please wait, logging you in...';
    return '';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 sm:space-y-6" 
        noValidate
        role="form"
        aria-label="Login form"
      >
        <div className="space-y-2">
          <Label 
            htmlFor="phone-number"
            className="text-sm font-medium text-gray-700 sm:text-base"
          >
            Mobile Number <span className="text-red-500" aria-label="required field">*</span>
          </Label>
          <Input
            id="phone-number"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="09xxxxxxxxx"
            disabled={isLoading || isRedirecting}
            className={cn(
              "w-full transition-all duration-200",
              error && error.type === 'validation' && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
              (isLoading || isRedirecting) && "opacity-75"
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'phone-error' : 'phone-help'}
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={13}
          />
          <div id="phone-help" className="text-xs text-gray-500 sm:text-sm">
            Enter your Iranian mobile number (09xxxxxxxxx format)
          </div>
          {error && (
            <div 
              id="phone-error"
              className={cn(
                "flex items-start gap-2 p-3 rounded-md text-sm",
                error.type === 'validation' && "bg-red-50 text-red-700 border border-red-200",
                error.type === 'network' && "bg-orange-50 text-orange-700 border border-orange-200",
                error.type === 'api' && "bg-yellow-50 text-yellow-700 border border-yellow-200",
                error.type === 'storage' && "bg-purple-50 text-purple-700 border border-purple-200",
                error.type === 'redirect' && "bg-blue-50 text-blue-700 border border-blue-200",
                error.type === 'general' && "bg-gray-50 text-gray-700 border border-gray-200"
              )}
              role="alert"
              aria-live="polite"
            >
              <div className="flex-shrink-0 mt-0.5">
                {error.type === 'validation' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {error.type === 'network' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {(error.type === 'api' || error.type === 'general') && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {error.type === 'validation' && 'Validation Error'}
                  {error.type === 'network' && 'Connection Error'}
                  {error.type === 'api' && 'Service Error'}
                  {error.type === 'storage' && 'Storage Error'}
                  {error.type === 'redirect' && 'Navigation Error'}
                  {error.type === 'general' && 'Unexpected Error'}
                </p>
                <p>{error.message}</p>
                {error.retryable && retryCount > 0 && (
                  <p className="text-xs mt-1 opacity-75">
                    Attempt {retryCount} of 3
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Button
            type="submit"
            disabled={isLoading || isRedirecting}
            size="lg"
            className={cn(
              "w-full transition-all duration-200",
              (isLoading || isRedirecting) && "opacity-75"
            )}
            aria-describedby={(isLoading || isRedirecting) ? 'loading-status' : undefined}
            aria-label={isLoading ? 'Logging in, please wait' : isRedirecting ? 'Redirecting to dashboard' : 'Login to your account'}
          >
            {(isLoading || isRedirecting) && (
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {getLoadingMessage()}
          </Button>

          {error?.retryable && retryCount < 3 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleRetry}
              disabled={isLoading || isRedirecting}
              className="w-full"
              aria-label="Retry login attempt"
            >
              Try Again
            </Button>
          )}

          {retryCount >= 3 && error?.retryable && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2 sm:text-base">
                Multiple attempts failed. Please try again later or contact support.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => window.location.reload()}
                className="text-sm sm:text-base"
                aria-label="Refresh the page to try again"
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>

        {(isLoading || isRedirecting) && (
          <div 
            id="loading-status"
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {getAriaLiveMessage()}
          </div>
        )}
      </form>
    </div>
  );
}