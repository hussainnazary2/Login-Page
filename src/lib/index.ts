/**
 * Centralized library exports for better import organization
 * This file provides a single entry point for all utility functions
 */

// Utility functions
export { cn } from "./utils";

// Authentication utilities
export {
  saveUserToStorage,
  getUserFromStorage,
  clearUserFromStorage,
  isAuthenticated,
  getAuthState,
} from "./auth";

// Validation utilities
export { validateIranianPhone } from "./validation";

// API utilities
export { fetchRandomUser, ApiError } from "./api";

// Type definitions
export type { User, ApiResponse } from "../types/user";