import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  saveUserToStorage, 
  getUserFromStorage, 
  clearUserFromStorage, 
  isAuthenticated, 
  getAuthState 
} from '../auth';
import { User } from '@/types/user';

// Mock user data for testing
const mockUser: User = {
  name: {
    first: 'John',
    last: 'Doe'
  },
  email: 'john.doe@example.com',
  picture: {
    large: 'https://example.com/large.jpg',
    medium: 'https://example.com/medium.jpg',
    thumbnail: 'https://example.com/thumb.jpg'
  }
};

const invalidUser = {
  name: { first: 'John' }, // missing last name
  email: 'john@example.com'
  // missing picture
} as User;

describe('saveUserToStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset all localStorage mocks to their default behavior
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
      const store = (localStorage as any).__store__ || {};
      store[key] = value;
      (localStorage as any).__store__ = store;
    });
  });

  it('should save valid user data to localStorage', () => {
    expect(() => saveUserToStorage(mockUser)).not.toThrow();
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
  });

  it('should throw error for invalid user data', () => {
    expect(() => saveUserToStorage(null as any)).toThrow('Invalid user data: missing required fields');
    expect(() => saveUserToStorage(undefined as any)).toThrow('Invalid user data: missing required fields');
    expect(() => saveUserToStorage(invalidUser)).toThrow('Invalid user data: missing required fields');
  });

  it('should throw error when localStorage is not available', () => {
    // Mock localStorage as undefined
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true
    });

    expect(() => saveUserToStorage(mockUser)).toThrow('Browser storage is not available. Please enable localStorage and try again.');

    // Restore localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  it('should handle localStorage quota exceeded error', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });

    expect(() => saveUserToStorage(mockUser)).toThrow('Storage quota exceeded. Please clear some browser data and try again.');
  });

  it('should handle generic localStorage errors', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('Generic storage error');
    });

    expect(() => saveUserToStorage(mockUser)).toThrow('Generic storage error');
  });
});

describe('getUserFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset localStorage mocks to default behavior
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      const store = (localStorage as any).__store__ || {};
      return store[key] || null;
    });
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
      const store = (localStorage as any).__store__ || {};
      store[key] = value;
      (localStorage as any).__store__ = store;
    });
    vi.mocked(localStorage.removeItem).mockImplementation((key) => {
      const store = (localStorage as any).__store__ || {};
      delete store[key];
      (localStorage as any).__store__ = store;
    });
  });

  it('should retrieve valid user data from localStorage', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    const result = getUserFromStorage();
    expect(result).toEqual(mockUser);
    expect(localStorage.getItem).toHaveBeenCalledWith('auth_user');
  });

  it('should return null when no user data exists', () => {
    const result = getUserFromStorage();
    expect(result).toBeNull();
  });

  it('should return null when localStorage is not available', () => {
    // Mock localStorage as undefined
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true
    });

    const result = getUserFromStorage();
    expect(result).toBeNull();

    // Restore localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  it('should handle corrupted JSON data', () => {
    localStorage.setItem('auth_user', 'invalid json');
    
    const result = getUserFromStorage();
    expect(result).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should validate user data structure and clear invalid data', () => {
    const invalidStoredUser = {
      name: { first: 'John' }, // missing last name
      email: 'john@example.com'
      // missing picture
    };
    
    localStorage.setItem('auth_user', JSON.stringify(invalidStoredUser));
    
    const result = getUserFromStorage();
    expect(result).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should handle localStorage access errors', () => {
    vi.mocked(localStorage.getItem).mockImplementation(() => {
      throw new Error('Access denied');
    });

    const result = getUserFromStorage();
    expect(result).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should validate all required user fields', () => {
    const testCases = [
      { ...mockUser, name: undefined }, // missing name
      { ...mockUser, name: { first: 'John' } }, // missing last name
      { ...mockUser, email: undefined }, // missing email
      { ...mockUser, picture: undefined }, // missing picture
      { ...mockUser, picture: { large: 'url' } }, // incomplete picture
    ];

    testCases.forEach((invalidUser, index) => {
      localStorage.clear();
      vi.clearAllMocks();
      
      localStorage.setItem('auth_user', JSON.stringify(invalidUser));
      
      const result = getUserFromStorage();
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });
});

describe('clearUserFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset localStorage mocks to default behavior
    vi.mocked(localStorage.removeItem).mockImplementation((key) => {
      const store = (localStorage as any).__store__ || {};
      delete store[key];
      (localStorage as any).__store__ = store;
    });
  });

  it('should clear user data from localStorage', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    expect(() => clearUserFromStorage()).not.toThrow();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should throw error when localStorage is not available', () => {
    // Mock localStorage as undefined
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true
    });

    expect(() => clearUserFromStorage()).toThrow('localStorage is not available in this browser');

    // Restore localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  it('should handle localStorage access errors', () => {
    vi.mocked(localStorage.removeItem).mockImplementation(() => {
      throw new Error('Access denied');
    });

    expect(() => clearUserFromStorage()).toThrow('Access denied');
  });
});

describe('isAuthenticated', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset localStorage mocks to default behavior
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      const store = (localStorage as any).__store__ || {};
      return store[key] || null;
    });
  });

  it('should return true when valid user data exists', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    expect(isAuthenticated()).toBe(true);
  });

  it('should return false when no user data exists', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('should return false when user data is invalid', () => {
    localStorage.setItem('auth_user', 'invalid json');
    
    expect(isAuthenticated()).toBe(false);
  });

  it('should return false when localStorage is not available', () => {
    // Mock localStorage as undefined
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true
    });

    expect(isAuthenticated()).toBe(false);

    // Restore localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });
});

describe('getAuthState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset localStorage mocks to default behavior
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      const store = (localStorage as any).__store__ || {};
      return store[key] || null;
    });
  });

  it('should return authenticated state with user data when user exists', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    const authState = getAuthState();
    expect(authState).toEqual({
      isAuthenticated: true,
      user: mockUser
    });
  });

  it('should return unauthenticated state when no user exists', () => {
    const authState = getAuthState();
    expect(authState).toEqual({
      isAuthenticated: false,
      user: null
    });
  });

  it('should return unauthenticated state when user data is invalid', () => {
    localStorage.setItem('auth_user', 'invalid json');
    
    const authState = getAuthState();
    expect(authState).toEqual({
      isAuthenticated: false,
      user: null
    });
  });

  it('should handle localStorage errors gracefully', () => {
    vi.mocked(localStorage.getItem).mockImplementation(() => {
      throw new Error('Storage error');
    });

    const authState = getAuthState();
    expect(authState).toEqual({
      isAuthenticated: false,
      user: null
    });
  });
});