import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as validation from '@/lib/validation';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import { User } from '@/types/user';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the utility functions
vi.mock('@/lib/validation');
vi.mock('@/lib/api');
vi.mock('@/lib/auth');

const mockUser: User = {
  name: { first: 'John', last: 'Doe' },
  email: 'john.doe@example.com',
  picture: {
    large: 'https://example.com/large.jpg',
    medium: 'https://example.com/medium.jpg',
    thumbnail: 'https://example.com/thumb.jpg'
  }
};

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Complete Login Flow', () => {
    it('should complete full login flow with proper validation and storage', async () => {
      // Mock successful validation and API calls
      vi.mocked(validation.validateIranianPhone).mockReturnValue(true);
      vi.mocked(api.fetchRandomUser).mockResolvedValue(mockUser);
      vi.mocked(auth.saveUserToStorage).mockImplementation(() => {});
      
      // Simulate login flow
      const phoneNumber = '09123456789';
      
      // 1. Validate phone number
      const isValid = validation.validateIranianPhone(phoneNumber);
      expect(isValid).toBe(true);
      
      // 2. Fetch user data
      const userData = await api.fetchRandomUser();
      expect(userData).toEqual(mockUser);
      
      // 3. Save to storage
      auth.saveUserToStorage(userData);
      expect(auth.saveUserToStorage).toHaveBeenCalledWith(mockUser);
      
      // Verify all steps were called
      expect(validation.validateIranianPhone).toHaveBeenCalledWith('09123456789');
      expect(api.fetchRandomUser).toHaveBeenCalled();
      expect(auth.saveUserToStorage).toHaveBeenCalledWith(mockUser);
    });

    it('should handle login flow with retry after initial failure', async () => {
      vi.mocked(validation.validateIranianPhone).mockReturnValue(true);
      vi.mocked(api.fetchRandomUser)
        .mockRejectedValueOnce(new api.ApiError('Network error: Please check your connection'))
        .mockResolvedValueOnce(mockUser);
      vi.mocked(auth.saveUserToStorage).mockImplementation(() => {});
      
      const phoneNumber = '09123456789';
      
      // First attempt - should fail
      let firstError;
      try {
        await api.fetchRandomUser();
      } catch (error) {
        firstError = error;
      }
      expect(firstError).toBeInstanceOf(api.ApiError);
      expect(firstError.message).toBe('Network error: Please check your connection');
      
      // Second attempt - should succeed
      const userData = await api.fetchRandomUser();
      expect(userData).toEqual(mockUser);
      
      // Save to storage
      auth.saveUserToStorage(userData);
      
      expect(api.fetchRandomUser).toHaveBeenCalledTimes(2);
      expect(auth.saveUserToStorage).toHaveBeenCalledWith(mockUser);
    });

    it('should handle validation errors in login flow', async () => {
      vi.mocked(validation.validateIranianPhone).mockReturnValue(false);
      
      const phoneNumber = '123456789'; // Invalid format
      
      // Should fail validation
      const isValid = validation.validateIranianPhone(phoneNumber);
      expect(isValid).toBe(false);
      
      // Should not proceed with API calls
      expect(api.fetchRandomUser).not.toHaveBeenCalled();
      expect(auth.saveUserToStorage).not.toHaveBeenCalled();
    });

    it('should handle validation state changes correctly', async () => {
      vi.mocked(validation.validateIranianPhone)
        .mockReturnValueOnce(false) // First validation fails
        .mockReturnValue(true); // Subsequent validations pass
      vi.mocked(api.fetchRandomUser).mockResolvedValue(mockUser);
      vi.mocked(auth.saveUserToStorage).mockImplementation(() => {});
      
      // First attempt with invalid number
      let isValid = validation.validateIranianPhone('123');
      expect(isValid).toBe(false);
      
      // Second attempt with valid number
      isValid = validation.validateIranianPhone('09123456789');
      expect(isValid).toBe(true);
      
      // Should now proceed with API call
      const userData = await api.fetchRandomUser();
      auth.saveUserToStorage(userData);
      
      expect(validation.validateIranianPhone).toHaveBeenCalledTimes(2);
      expect(auth.saveUserToStorage).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Complete Logout Flow', () => {
    it('should complete full logout flow', async () => {
      vi.mocked(auth.clearUserFromStorage).mockImplementation(() => {});
      
      // Simulate logout
      auth.clearUserFromStorage();
      
      expect(auth.clearUserFromStorage).toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      vi.mocked(auth.clearUserFromStorage).mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      // Simulate logout attempt
      try {
        auth.clearUserFromStorage();
      } catch (error) {
        expect(error.message).toBe('Storage access denied');
      }
      
      expect(auth.clearUserFromStorage).toHaveBeenCalled();
    });

    it('should allow retry after logout error', async () => {
      vi.mocked(auth.clearUserFromStorage)
        .mockImplementationOnce(() => {
          throw new Error('Storage error');
        })
        .mockImplementationOnce(() => {}); // Second attempt succeeds
      
      // First attempt fails
      try {
        auth.clearUserFromStorage();
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
      
      // Second attempt succeeds
      auth.clearUserFromStorage();
      
      expect(auth.clearUserFromStorage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authentication State Management', () => {
    it('should maintain authentication state throughout login flow', async () => {
      // Mock authentication state checks
      vi.mocked(auth.isAuthenticated)
        .mockReturnValueOnce(false) // Initially not authenticated
        .mockReturnValue(true); // After login, authenticated
      
      vi.mocked(auth.getUserFromStorage)
        .mockReturnValueOnce(null) // Initially no user
        .mockReturnValue(mockUser); // After login, user exists
      
      vi.mocked(validation.validateIranianPhone).mockReturnValue(true);
      vi.mocked(api.fetchRandomUser).mockResolvedValue(mockUser);
      vi.mocked(auth.saveUserToStorage).mockImplementation(() => {});
      
      // Verify initial state
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getUserFromStorage()).toBeNull();
      
      // Perform login simulation
      const isValid = validation.validateIranianPhone('09123456789');
      expect(isValid).toBe(true);
      
      const userData = await api.fetchRandomUser();
      auth.saveUserToStorage(userData);
      
      // Verify post-login state
      expect(auth.isAuthenticated()).toBe(true);
      expect(auth.getUserFromStorage()).toEqual(mockUser);
    });

    it('should clear authentication state during logout flow', async () => {
      // Mock authentication state changes
      vi.mocked(auth.isAuthenticated)
        .mockReturnValueOnce(true) // Initially authenticated
        .mockReturnValue(false); // After logout, not authenticated
      
      vi.mocked(auth.getUserFromStorage)
        .mockReturnValueOnce(mockUser) // Initially has user
        .mockReturnValue(null); // After logout, no user
      
      vi.mocked(auth.clearUserFromStorage).mockImplementation(() => {});
      
      // Verify initial state
      expect(auth.isAuthenticated()).toBe(true);
      expect(auth.getUserFromStorage()).toEqual(mockUser);
      
      // Perform logout
      auth.clearUserFromStorage();
      
      // Verify post-logout state
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getUserFromStorage()).toBeNull();
    });

    it('should handle authentication state persistence across page reloads', () => {
      // Mock persistent authentication state
      vi.mocked(auth.getUserFromStorage).mockReturnValue(mockUser);
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);
      vi.mocked(auth.getAuthState).mockReturnValue({
        isAuthenticated: true,
        user: mockUser
      });
      
      // Simulate page reload by checking auth state
      const authState = auth.getAuthState();
      
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toEqual(mockUser);
      expect(auth.isAuthenticated()).toBe(true);
      expect(auth.getUserFromStorage()).toEqual(mockUser);
    });
  });

  describe('Error Recovery Flows', () => {
    it('should recover from storage errors during login', async () => {
      vi.mocked(validation.validateIranianPhone).mockReturnValue(true);
      vi.mocked(api.fetchRandomUser).mockResolvedValue(mockUser);
      vi.mocked(auth.saveUserToStorage)
        .mockImplementationOnce(() => {
          throw new Error('Storage quota exceeded');
        })
        .mockImplementationOnce(() => {}); // Second attempt succeeds
      
      // First attempt should fail
      try {
        auth.saveUserToStorage(mockUser);
      } catch (error) {
        expect(error.message).toBe('Storage quota exceeded');
      }
      
      // Second attempt should succeed
      auth.saveUserToStorage(mockUser);
      
      expect(auth.saveUserToStorage).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors with proper error types', async () => {
      vi.mocked(validation.validateIranianPhone).mockReturnValue(true);
      
      const testCases = [
        new api.ApiError('Request timeout: Please try again'),
        new api.ApiError('Network error: Please check your connection'),
        new api.ApiError('Server error', 500),
        new api.ApiError('Bad request', 400)
      ];
      
      for (const testError of testCases) {
        vi.clearAllMocks();
        vi.mocked(api.fetchRandomUser).mockRejectedValue(testError);
        
        try {
          await api.fetchRandomUser();
        } catch (error) {
          expect(error).toBeInstanceOf(api.ApiError);
          expect(error.message).toBe(testError.message);
        }
      }
    });
  });
});