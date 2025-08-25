# Development Guide

## Overview

This guide provides comprehensive information for developers working on the Client Authentication System. It covers setup, development workflow, testing strategies, and best practices.

## Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended editor with extensions

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/client-auth-app.git
   cd client-auth-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app should load with the login page

### VS Code Setup

#### Recommended Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "vitest.explorer",
    "ms-playwright.playwright"
  ]
}
```

#### Settings Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard route
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── __tests__/        # Component tests
│   └── [feature].tsx     # Feature components
├── lib/                  # Utility functions
│   ├── __tests__/        # Library tests
│   └── [module].ts       # Utility modules
├── types/               # TypeScript definitions
└── test/               # Test configuration
```

### Design Patterns

#### Component Structure
```typescript
// components/example-component.tsx
'use client'; // Only if client-side features needed

import React from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export function ExampleComponent({ 
  title, 
  className, 
  children 
}: ExampleComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

#### Utility Functions
```typescript
// lib/example-utils.ts
/**
 * Utility function with JSDoc documentation
 * @param input - Description of parameter
 * @returns Description of return value
 * @throws Error description
 */
export function exampleFunction(input: string): string {
  if (!input) {
    throw new Error('Input is required');
  }
  
  return input.toLowerCase();
}
```

#### Type Definitions
```typescript
// types/example.ts
export interface ExampleType {
  id: string;
  name: string;
  optional?: boolean;
}

export type ExampleUnion = 'option1' | 'option2' | 'option3';
```

## Development Workflow

### Daily Development

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Run Tests in Watch Mode**
   ```bash
   npm run test
   ```

3. **Lint Code**
   ```bash
   npm run lint
   ```

### Feature Development

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Implement Feature**
   - Write TypeScript interfaces first
   - Implement utility functions with tests
   - Create components with proper props
   - Add integration tests

3. **Test Implementation**
   ```bash
   npm run test:run
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Code Review Process

1. **Self Review Checklist**
   - [ ] TypeScript compiles without errors
   - [ ] All tests pass
   - [ ] ESLint passes without warnings
   - [ ] Accessibility tested
   - [ ] Mobile responsiveness verified
   - [ ] Error handling implemented

2. **Create Pull Request**
   - Use descriptive title and description
   - Link related issues
   - Add screenshots for UI changes
   - Request review from team members

## Testing Strategy

### Test Structure

```
src/
├── lib/__tests__/
│   ├── auth.test.ts           # Unit tests for auth utilities
│   ├── api.test.ts            # API integration tests
│   └── validation.test.ts     # Validation function tests
├── components/__tests__/
│   └── error-handling.test.tsx # Component interaction tests
└── test/
    └── setup.ts               # Global test configuration
```

### Writing Tests

#### Unit Tests
```typescript
// lib/__tests__/example.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exampleFunction } from '../example';

describe('exampleFunction', () => {
  it('should transform input correctly', () => {
    const result = exampleFunction('TEST');
    expect(result).toBe('test');
  });

  it('should throw error for empty input', () => {
    expect(() => exampleFunction('')).toThrow('Input is required');
  });
});
```

#### Component Tests
```typescript
// components/__tests__/example.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExampleComponent } from '../example-component';

describe('ExampleComponent', () => {
  it('renders with correct title', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<ExampleComponent title="Test" onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

#### Integration Tests
```typescript
// lib/__tests__/auth-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  saveUserToStorage, 
  getUserFromStorage, 
  clearUserFromStorage 
} from '../auth';

describe('Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should complete full auth cycle', () => {
    const mockUser = {
      name: { first: 'John', last: 'Doe' },
      email: 'john@example.com',
      picture: { large: '', medium: '', thumbnail: '' }
    };

    // Save user
    saveUserToStorage(mockUser);
    
    // Retrieve user
    const retrievedUser = getUserFromStorage();
    expect(retrievedUser).toEqual(mockUser);
    
    // Clear user
    clearUserFromStorage();
    expect(getUserFromStorage()).toBeNull();
  });
});
```

### Test Commands

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- auth.test.ts

# Run tests with coverage
npm run test -- --coverage
```

## Styling Guidelines

### Tailwind CSS Usage

#### Component Styling
```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        // Base styles
        "px-4 py-2 rounded-md font-medium transition-colors",
        // Variant styles
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
          "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
        },
        // Custom classes
        className
      )}
      {...props}
    />
  );
}
```

#### Responsive Design
```typescript
// Mobile-first approach
<div className="
  w-full p-4           // Mobile: full width, 1rem padding
  sm:w-auto sm:p-6     // Small screens: auto width, 1.5rem padding
  md:max-w-md md:p-8   // Medium screens: max width, 2rem padding
  lg:max-w-lg          // Large screens: larger max width
">
```

#### Accessibility Classes
```typescript
// Focus indicators
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-blue-500 
  focus:ring-offset-2
">

// Screen reader only content
<span className="sr-only">
  Loading, please wait
</span>
```

### CSS Custom Properties

```css
/* globals.css */
:root {
  /* Color palette using OKLCH */
  --primary: oklch(47.78% 0.111 238.66);
  --secondary: oklch(84.71% 0.0054 238.66);
  --accent: oklch(74.51% 0.167 183.61);
  
  /* Spacing scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Client-side only if needed
});
```

### Image Optimization

```typescript
import Image from 'next/image';

function UserAvatar({ user }) {
  return (
    <Image
      src={user.picture.thumbnail}
      alt={`${user.name.first}'s avatar`}
      width={40}
      height={40}
      className="rounded-full"
      priority={false} // Only true for above-fold images
    />
  );
}
```

### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Analyze bundle
ANALYZE=true npm run build
```

## Accessibility Guidelines

### ARIA Implementation

```typescript
// Form accessibility
<form role="form" aria-label="Login form">
  <label htmlFor="phone" className="sr-only">
    Mobile Number
  </label>
  <input
    id="phone"
    type="tel"
    aria-describedby="phone-help phone-error"
    aria-invalid={hasError ? 'true' : 'false'}
    aria-required="true"
  />
  <div id="phone-help" className="text-sm text-gray-600">
    Enter your Iranian mobile number
  </div>
  {hasError && (
    <div id="phone-error" role="alert" aria-live="polite">
      {errorMessage}
    </div>
  )}
</form>
```

### Keyboard Navigation

```typescript
// Custom keyboard handling
function handleKeyDown(event: React.KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
}

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
  className="focus:outline-none focus:ring-2"
>
  Custom button
</div>
```

### Screen Reader Support

```typescript
// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? 'Loading, please wait' : ''}
</div>

// Status announcements
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

## Error Handling

### Error Boundaries

```typescript
// components/error-boundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">
            Something went wrong
          </h2>
          <p className="text-red-600">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// lib/error-handling.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
}
```

## Security Best Practices

### Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

const phoneSchema = z.string()
  .min(11, 'Phone number too short')
  .max(13, 'Phone number too long')
  .regex(/^(09|(\+|00)989)\d{9}$/, 'Invalid Iranian phone format');

export function validatePhoneNumber(phone: string): boolean {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}
```

### XSS Prevention

```typescript
// Always use React's built-in escaping
function UserProfile({ user }) {
  return (
    <div>
      {/* Safe - React escapes by default */}
      <h1>{user.name}</h1>
      
      {/* Dangerous - avoid dangerouslySetInnerHTML */}
      <div dangerouslySetInnerHTML={{ __html: userContent }} />
    </div>
  );
}
```

### Content Security Policy

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://randomuser.me",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

## Debugging

### Development Tools

1. **React Developer Tools**
   - Install browser extension
   - Inspect component props and state
   - Profile component performance

2. **Next.js DevTools**
   - Built-in development server
   - Hot reload and error overlay
   - Build analysis

3. **Browser DevTools**
   - Network tab for API calls
   - Console for error messages
   - Application tab for localStorage

### Debugging Techniques

```typescript
// Debug logging
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Error logging
function logError(error: Error, context?: string) {
  console.error(`[ERROR] ${context || 'Unknown'}:`, error);
  
  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
}
```

## Deployment Preparation

### Pre-deployment Checklist

- [ ] All tests pass (`npm run test:run`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Accessibility tested
- [ ] Performance optimized
- [ ] Error handling implemented
- [ ] Security headers configured

### Environment Configuration

```bash
# .env.local (development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# .env.production (production)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --showConfig
   
   # Restart TypeScript server in VS Code
   Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
   ```

2. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node_modules
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Test Failures**
   ```bash
   # Run tests with verbose output
   npm run test -- --reporter=verbose
   
   # Clear test cache
   npm run test -- --clearCache
   ```

### Getting Help

- **Documentation**: Check Next.js and React documentation
- **Community**: Stack Overflow, GitHub Discussions
- **Team**: Internal documentation and team members
- **Issues**: Create GitHub issues for bugs or feature requests