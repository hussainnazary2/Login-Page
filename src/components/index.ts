/**
 * Centralized component exports for better import organization
 * This file provides a single entry point for all components
 */

// UI Components
export { Button, buttonVariants } from "./ui/button";
export { Input } from "./ui/input";
export { Label } from "./ui/label";

// Feature Components
export { LoginForm } from "./login-form";
export { DashboardHeader } from "./dashboard-header";
export { ErrorBoundary } from "./error-boundary";

// Re-export UI components as a namespace for cleaner imports
export * as UI from "./ui";