'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { clearUserFromStorage } from '@/lib/auth';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  user: User;
  className?: string;
}

export function DashboardHeader({ user, className }: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      // Clear user data from storage
      clearUserFromStorage();
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to login page
      router.push('/');
    } catch (_error) {
      setLogoutError('Unable to log out properly. Please refresh the page.');
      setIsLoggingOut(false);
    }
  };

  const fullName = `${user.name.first} ${user.name.last}`;

  return (
    <header 
      className={cn(
        "w-full bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 lg:px-8",
        className
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Welcome message and user info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user.picture.thumbnail}
                alt={`${fullName}'s profile picture`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-200 flex-shrink-0"
                onError={(e) => {
                  // Fallback for broken images
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e5e7eb&color=374151`;
                }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold text-gray-900 sm:text-lg truncate">
                  Welcome, {user.name.first}!
                </h1>
                <p className="text-sm text-gray-600 truncate sm:text-base" aria-label="User email">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="lg"
              disabled={isLoggingOut}
              className={cn(
                "w-full sm:w-auto transition-all duration-200",
                isLoggingOut && "opacity-75"
              )}
              aria-label="Log out of your account"
              aria-describedby={isLoggingOut ? 'logout-status' : undefined}
            >
              {isLoggingOut && (
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
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>

            {logoutError && (
              <div 
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 sm:text-base"
                role="alert"
                aria-live="polite"
              >
                {logoutError}
              </div>
            )}
          </div>
        </div>

        {isLoggingOut && (
          <div 
            id="logout-status"
            className="sr-only"
            aria-live="polite"
          >
            Logging you out, please wait...
          </div>
        )}
      </div>
    </header>
  );
}