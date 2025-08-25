import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * This ensures Tailwind classes are properly merged and deduplicated
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a name for display purposes
 * Handles edge cases like missing names or empty strings
 */
export function formatName(firstName?: string, lastName?: string): string {
  const first = firstName?.trim() || "";
  const last = lastName?.trim() || "";
  
  if (!first && !last) return "Unknown User";
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
}

/**
 * Generates initials from a name
 * Used for avatar fallbacks
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.trim()?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.trim()?.charAt(0)?.toUpperCase() || "";
  
  return first + last || "U";
}

/**
 * Debounce function for performance optimization
 * Useful for search inputs and API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for adding delays
 * Useful for UX improvements and testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
