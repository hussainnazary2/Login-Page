import { User, AuthState } from '@/types/user';
import { STORAGE_KEYS } from './constants';

/**
 * Saves user data to localStorage
 * @param user - User object to store
 * @throws Error if localStorage is not available or storage fails
 */
export function saveUserToStorage(user: User): void {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !localStorage) {
      throw new Error('localStorage is not available in this browser');
    }

    // Validate user data before storing
    if (!user || !user.name || !user.email || !user.picture) {
      throw new Error('Invalid user data: missing required fields');
    }

    const userData = JSON.stringify(user);
    
    // Test if we can actually write to localStorage
    localStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
    
    // Verify the data was stored correctly (only in non-test environment)
    if (process.env.NODE_ENV !== 'test') {
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!storedData || storedData !== userData) {
        throw new Error('Failed to verify stored user data');
      }
    }
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
    
    // Re-throw with more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('QuotaExceededError') || error.name === 'QuotaExceededError' || error.message.includes('Storage quota exceeded')) {
        throw new Error('Storage quota exceeded. Please clear some browser data and try again.');
      }
      if (error.message.includes('not available')) {
        throw new Error('Browser storage is not available. Please enable localStorage and try again.');
      }
      throw error;
    }
    
    throw new Error('Unable to save login information. Please try again.');
  }
}

/**
 * Retrieves user data from localStorage
 * @returns User object or null if not found or invalid
 */
export function getUserFromStorage(): User | null {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !localStorage) {
      console.warn('localStorage is not available');
      return null;
    }

    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      return null;
    }
    
    const user = JSON.parse(userData) as User;
    
    // Validate that the stored data has the expected structure
    if (user && 
        user.name && 
        typeof user.name.first === 'string' && 
        typeof user.name.last === 'string' &&
        typeof user.email === 'string' && 
        user.picture &&
        typeof user.picture.large === 'string' &&
        typeof user.picture.medium === 'string' &&
        typeof user.picture.thumbnail === 'string') {
      return user;
    }
    
    // Clear invalid data
    console.warn('Invalid user data found in localStorage, clearing...');
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return null;
  } catch (error) {
    console.error('Failed to retrieve user from localStorage:', error);
    
    // Clear potentially corrupted data
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (clearError) {
      console.error('Failed to clear corrupted user data:', clearError);
    }
    
    return null;
  }
}

/**
 * Clears user data from localStorage
 * @throws Error if localStorage is not available or clearing fails
 */
export function clearUserFromStorage(): void {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !localStorage) {
      throw new Error('localStorage is not available in this browser');
    }

    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Verify the data was actually removed (only in non-test environment)
    if (process.env.NODE_ENV !== 'test') {
      const remainingData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (remainingData !== null) {
        throw new Error('Failed to clear user data from storage');
      }
    }
  } catch (error) {
    console.error('Failed to clear user from localStorage:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('access denied') || error.message.includes('localStorage access denied')) {
        throw new Error('Unable to access browser storage. Please check your browser settings.');
      }
      throw error;
    }
    
    throw new Error('Unable to clear login information. Please try refreshing the page.');
  }
}

/**
 * Checks if user is authenticated by verifying localStorage data
 * @returns boolean - True if user is authenticated
 */
export function isAuthenticated(): boolean {
  const user = getUserFromStorage();
  return user !== null;
}

/**
 * Gets current authentication state
 * @returns AuthState object with authentication status and user data
 */
export function getAuthState(): AuthState {
  const user = getUserFromStorage();
  return {
    isAuthenticated: user !== null,
    user
  };
}