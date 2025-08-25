/**
 * Centralized type exports for better import organization
 * This file provides a single entry point for all type definitions
 */

// User-related types
export type { User, ApiResponse, AuthState } from "./user";

// Common utility types
export type LoadingState = "idle" | "loading" | "success" | "error";
export type ErrorType = "validation" | "network" | "api" | "storage" | "redirect" | "general";

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form-related types
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// API-related types
export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
}