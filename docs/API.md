# API Documentation

## Overview

This document provides detailed API documentation for the Client Authentication System. The system uses a combination of external APIs and internal utilities to provide authentication functionality.

## External API Integration

### RandomUser API

The application integrates with the RandomUser.me API to fetch Iranian user data for authentication purposes, with custom hijab avatars.

**Base URL**: `https://randomuser.me/api/`
**Endpoint**: `?results=1&nat=ir`
**Method**: GET
**Timeout**: 10 seconds
**Avatar Service**: DiceBear API with hijab accessories

#### Response Format

```json
{
  "results": [
    {
      "name": {
        "title": "Mr",
        "first": "John",
        "last": "Doe"
      },
      "email": "john.doe@example.com",
      "picture": {
        "large": "https://randomuser.me/api/portraits/men/1.jpg",
        "medium": "https://randomuser.me/api/portraits/med/men/1.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/men/1.jpg"
      }
    }
  ],
  "info": {
    "seed": "abc123",
    "results": 1,
    "page": 1,
    "version": "1.4"
  }
}
```

## Internal API Functions

### Authentication Module (`src/lib/auth.ts`)

#### `saveUserToStorage(user: User): void`

Saves user data to localStorage with validation and error handling.

**Parameters:**
- `user: User` - User object to store

**Throws:**
- `Error` - If localStorage is unavailable
- `Error` - If user data is invalid
- `Error` - If storage quota is exceeded

**Example:**
```typescript
try {
  saveUserToStorage(userData);
  console.log('User saved successfully');
} catch (error) {
  console.error('Failed to save user:', error.message);
}
```

#### `getUserFromStorage(): User | null`

Retrieves and validates user data from localStorage.

**Returns:**
- `User | null` - User object if valid data exists, null otherwise

**Example:**
```typescript
const user = getUserFromStorage();
if (user) {
  console.log(`Welcome ${user.name.first}!`);
} else {
  console.log('No user data found');
}
```

#### `clearUserFromStorage(): void`

Removes user data from localStorage with verification.

**Throws:**
- `Error` - If localStorage is unavailable
- `Error` - If clearing fails

**Example:**
```typescript
try {
  clearUserFromStorage();
  console.log('User data cleared');
} catch (error) {
  console.error('Failed to clear user data:', error.message);
}
```

#### `isAuthenticated(): boolean`

Checks if user is currently authenticated.

**Returns:**
- `boolean` - True if valid user data exists

**Example:**
```typescript
if (isAuthenticated()) {
  // User is logged in
  redirectToDashboard();
} else {
  // User needs to log in
  redirectToLogin();
}
```

#### `getAuthState(): AuthState`

Gets complete authentication state.

**Returns:**
- `AuthState` - Object containing authentication status and user data

**Example:**
```typescript
const { isAuthenticated, user } = getAuthState();
console.log('Auth status:', isAuthenticated);
console.log('User data:', user);
```

### API Client Module (`src/lib/api.ts`)

#### `fetchRandomUser(): Promise<User>`

Fetches random user data from RandomUser API with comprehensive error handling.

**Returns:**
- `Promise<User>` - Promise resolving to User object

**Throws:**
- `ApiError` - For API-related errors with status codes
- `ApiError` - For network timeouts and connection issues
- `ApiError` - For invalid response data

**Example:**
```typescript
try {
  const user = await fetchRandomUser();
  console.log('Fetched user:', user.name.first);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    if (error.status) {
      console.error('Status Code:', error.status);
    }
  }
}
```

#### `checkApiHealth(): Promise<boolean>`

Checks if the RandomUser API is reachable (utility function).

**Returns:**
- `Promise<boolean>` - True if API is reachable

**Example:**
```typescript
const isHealthy = await checkApiHealth();
if (!isHealthy) {
  console.warn('API may be unavailable');
}
```

### Validation Module (`src/lib/validation.ts`)

#### `validateIranianPhone(phone: string): boolean`

Validates Iranian mobile phone number formats.

**Parameters:**
- `phone: string` - Phone number to validate

**Returns:**
- `boolean` - True if phone number is valid

**Supported Formats:**
- `09xxxxxxxxx` - Standard Iranian format
- `+989xxxxxxxxx` - International format with +98
- `00989xxxxxxxxx` - International format with 0098

**Example:**
```typescript
const validNumbers = [
  '09123456789',
  '+989123456789',
  '00989123456789'
];

validNumbers.forEach(number => {
  console.log(`${number}: ${validateIranianPhone(number)}`);
});
```

## Error Handling

### ApiError Class

Custom error class for API-related errors with additional context.

```typescript
class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}
```

**Properties:**
- `message: string` - Error description
- `status?: number` - HTTP status code (if applicable)
- `name: string` - Always 'ApiError'

### Error Types

#### Network Errors
- **Timeout**: Request exceeds 10-second limit
- **Connection**: Network connectivity issues
- **CORS**: Cross-origin request blocked

#### API Errors
- **4xx Status**: Client errors (bad request, not found)
- **5xx Status**: Server errors (internal error, service unavailable)
- **Invalid Response**: Malformed or missing data

#### Storage Errors
- **Quota Exceeded**: localStorage storage limit reached
- **Access Denied**: localStorage disabled or restricted
- **Invalid Data**: Corrupted or malformed stored data

## Constants

### Storage Keys
```typescript
export const STORAGE_KEYS = {
  USER_DATA: 'client_auth_user_data'
} as const;
```

### API Configuration
```typescript
export const API_CONFIG = {
  RANDOM_USER_URL: 'https://randomuser.me/api/?results=1&nat=us',
  REQUEST_TIMEOUT: 10000 // 10 seconds
} as const;
```

### Error Messages
```typescript
export const ERROR_MESSAGES = {
  NETWORK: {
    TIMEOUT: 'Request timed out. Please check your connection and try again.',
    CONNECTION_ERROR: 'Unable to connect. Please check your internet connection.'
  },
  VALIDATION: {
    INVALID_PHONE: 'Please enter a valid Iranian mobile number.',
    REQUIRED_FIELD: 'This field is required.'
  }
} as const;
```

## Type Definitions

### Core Types

```typescript
interface User {
  name: {
    first: string;
    last: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

interface ApiResponse {
  results: User[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}
```

### Component Props

```typescript
interface LoginFormProps {
  // Self-contained component with no props
}

interface DashboardHeaderProps {
  user: User;
  className?: string;
}
```

## Usage Examples

### Complete Authentication Flow

```typescript
import { 
  fetchRandomUser, 
  saveUserToStorage, 
  isAuthenticated,
  clearUserFromStorage 
} from '@/lib';

// Login process
async function login(phoneNumber: string) {
  try {
    // Validate phone number first
    if (!validateIranianPhone(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    
    // Fetch user data
    const user = await fetchRandomUser();
    
    // Save to storage
    saveUserToStorage(user);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Login failed:', error);
    // Handle error in UI
  }
}

// Logout process
function logout() {
  try {
    clearUserFromStorage();
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    // Handle error in UI
  }
}

// Check authentication on page load
function checkAuth() {
  if (isAuthenticated()) {
    // User is logged in
    return getUserFromStorage();
  } else {
    // Redirect to login if on protected page
    if (window.location.pathname === '/dashboard') {
      window.location.href = '/';
    }
    return null;
  }
}
```

### Error Handling Best Practices

```typescript
import { ApiError } from '@/lib/api';

async function handleLogin(phoneNumber: string) {
  try {
    const user = await fetchRandomUser();
    saveUserToStorage(user);
    return { success: true, user };
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API-specific errors
      if (error.status && error.status >= 500) {
        return { 
          success: false, 
          error: 'Server is temporarily unavailable. Please try again later.' 
        };
      } else if (error.message.includes('timeout')) {
        return { 
          success: false, 
          error: 'Request timed out. Please check your connection.' 
        };
      }
    }
    
    // Handle storage errors
    if (error instanceof Error && error.message.includes('storage')) {
      return { 
        success: false, 
        error: 'Unable to save login information. Please check browser settings.' 
      };
    }
    
    // Generic error fallback
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}
```