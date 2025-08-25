/**
 * Application constants for better maintainability
 * Centralized configuration values and magic numbers
 */

// API Configuration
export const API_CONFIG = {
  RANDOM_USER_URL: "https://randomuser.me/api/?results=1&nat=ir",
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: "auth_user_data",
  AUTH_STATE: "auth_state",
} as const;

// Iranian Phone Number Patterns
export const PHONE_PATTERNS = {
  STANDARD: /^09\d{9}$/,           // 09xxxxxxxxx
  INTERNATIONAL: /^\+989\d{9}$/,   // +989xxxxxxxxx
  COUNTRY_CODE: /^00989\d{9}$/,    // 00989xxxxxxxxx
} as const;

// UI Constants
export const UI_CONFIG = {
  LOADING_DELAY: 100,              // Minimum loading state duration
  REDIRECT_DELAY: 500,             // Delay before redirects
  DEBOUNCE_DELAY: 300,             // Input debounce delay
  ANIMATION_DURATION: 200,         // Standard animation duration
  TOAST_DURATION: 5000,            // Toast notification duration
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    PHONE_REQUIRED: "Mobile number is required. Please enter your Iranian mobile number.",
    PHONE_INVALID: "Please enter a valid Iranian mobile number. Accepted formats: 09xxxxxxxxx, +989xxxxxxxxx, or 00989xxxxxxxxx",
  },
  NETWORK: {
    CONNECTION_ERROR: "Unable to connect to the server. Please check your internet connection and try again.",
    TIMEOUT: "Request timed out. Please check your internet connection and try again.",
    OFFLINE: "You appear to be offline. Please check your internet connection.",
  },
  API: {
    SERVER_ERROR: "Server is temporarily unavailable. Please try again in a few moments.",
    BAD_REQUEST: "There was a problem with your request. Please try again.",
    SERVICE_UNAVAILABLE: "Service unavailable, please try again later.",
  },
  STORAGE: {
    SAVE_ERROR: "Unable to save login information. Please check your browser settings and try again.",
    CORRUPTED_DATA: "Your login data appears to be corrupted or incomplete. Please log in again.",
  },
  NAVIGATION: {
    REDIRECT_ERROR: "Login successful but unable to redirect. Please refresh the page.",
    AUTH_CHECK_ERROR: "Unable to check authentication status. Please refresh the page.",
  },
  GENERAL: {
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    RETRY_LIMIT: "Multiple attempts failed. Please try again later or contact support.",
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful! Redirecting to dashboard...",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/",
  DASHBOARD: "/dashboard",
} as const;

// Accessibility
export const A11Y = {
  MIN_TOUCH_TARGET: 44, // Minimum touch target size in pixels
  FOCUS_OUTLINE_WIDTH: 2, // Focus outline width in pixels
  FOCUS_OUTLINE_OFFSET: 2, // Focus outline offset in pixels
} as const;