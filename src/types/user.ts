/**
 * User interface based on RandomUser API response structure
 */
export interface User {
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

/**
 * API response structure from RandomUser API
 */
export interface ApiResponse {
  results: User[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}

/**
 * Authentication state interface for client-side state management
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}