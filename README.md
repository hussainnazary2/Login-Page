# Client Authentication System

A modern, accessible client-side authentication system built with Next.js 15, TypeScript, and Tailwind CSS. Features Iranian mobile number validation, secure localStorage management, and comprehensive error handling with full test coverage.

## 🚀 Features

- **Iranian Mobile Number Authentication**: Supports multiple formats (09xxxxxxxxx, +989xxxxxxxxx, 00989xxxxxxxxx)
- **Iranian User Profiles**: Fetches Iranian user data with culturally appropriate hijab avatars
- **Client-Side Session Management**: Secure localStorage-based authentication state with validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Accessibility First**: WCAG 2.1 AA compliant with screen reader support and keyboard navigation
- **Comprehensive Error Handling**: User-friendly error messages, retry mechanisms, and graceful degradation
- **Type Safety**: Full TypeScript implementation with strict mode and no 'any' types
- **Modern UI Components**: Built with shadcn/ui component library and Radix UI primitives
- **Performance Optimized**: Turbopack bundling, font optimization, and efficient code splitting
- **Route Protection**: Automatic redirects based on authentication state
- **Comprehensive Testing**: Unit, integration, and component tests with 90%+ coverage

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript 5+ with strict mode
- **Styling**: Tailwind CSS v4 with OKLCH color space
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Testing**: Vitest with Testing Library and jsdom
- **Linting**: ESLint 9 with Next.js config
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard route
│   │   ├── layout.tsx     # Dashboard-specific layout
│   │   └── page.tsx       # Dashboard page component
│   ├── favicon.ico        # Application favicon
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Login page (root route)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx    # Button component with variants
│   │   ├── input.tsx     # Input component with validation states
│   │   ├── label.tsx     # Accessible label component
│   │   ├── toast.tsx     # Toast notification component
│   │   └── index.ts      # UI component exports
│   ├── __tests__/        # Component tests
│   ├── dashboard-header.tsx # Dashboard header with logout
│   ├── error-boundary.tsx   # Error boundary component
│   ├── login-form.tsx    # Login form with validation
│   └── index.ts          # Component exports
├── lib/                  # Utility functions and services
│   ├── __tests__/        # Library function tests
│   ├── api.ts           # RandomUser API client
│   ├── auth.ts          # Authentication utilities
│   ├── constants.ts     # Application constants
│   ├── utils.ts         # General utility functions
│   ├── validation.ts    # Phone number validation
│   └── index.ts         # Library exports
├── types/               # TypeScript type definitions
│   ├── user.ts         # User and API response types
│   └── index.ts        # Type exports
├── test/               # Test configuration
│   └── setup.ts        # Vitest setup and global config
└── middleware.ts       # Next.js middleware for route protection
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client-auth-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables (Optional)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📱 Usage

### Authentication Flow

1. **Login Page** (`/`):
   - Enter Iranian mobile number in supported formats:
     - `09xxxxxxxxx` (standard format)
     - `+989xxxxxxxxx` (international with +98)
     - `00989xxxxxxxxx` (international with 0098)
   - Real-time validation with user-friendly error messages
   - Automatic API call to RandomUser.me for demo user data
   - Secure localStorage storage of user session

2. **Dashboard Page** (`/dashboard`):
   - Protected route with automatic authentication checks
   - Personalized welcome message with user profile
   - User avatar with fallback handling
   - Secure logout functionality

3. **Route Protection**:
   - Unauthenticated users redirected to login
   - Authenticated users redirected from login to dashboard
   - Middleware-based protection for seamless UX

### Component Usage

#### LoginForm Component
```tsx
import { LoginForm } from '@/components/login-form';

// Self-contained component with built-in validation and error handling
<LoginForm />
```

#### DashboardHeader Component
```tsx
import { DashboardHeader } from '@/components/dashboard-header';
import { User } from '@/types/user';

const user: User = getUserFromStorage();
<DashboardHeader user={user} />
```

### API Integration

The system integrates with the RandomUser API for demo purposes:

```typescript
import { fetchRandomUser } from '@/lib/api';

// Fetch random user data with error handling
try {
  const user = await fetchRandomUser();
  // User data includes: name, email, picture
} catch (error) {
  // Handle ApiError with specific error types
}
```

### Authentication Utilities

```typescript
import { 
  saveUserToStorage, 
  getUserFromStorage, 
  clearUserFromStorage, 
  isAuthenticated 
} from '@/lib/auth';

// Save user after successful login
saveUserToStorage(userData);

// Check authentication status
const isLoggedIn = isAuthenticated();

// Get current user data
const currentUser = getUserFromStorage();

// Logout user
clearUserFromStorage();
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with interactive UI
npm run test:ui
```

### Test Coverage

The project includes comprehensive test suites:

#### Unit Tests
- **Authentication utilities** (`src/lib/__tests__/auth.test.ts`)
  - localStorage operations with error handling
  - User data validation and sanitization
  - Authentication state management

- **Phone validation** (`src/lib/__tests__/validation.test.ts`)
  - Iranian mobile number format validation
  - Edge cases and invalid input handling

- **API integration** (`src/lib/__tests__/api.test.ts`)
  - RandomUser API calls with timeout handling
  - Error scenarios and network failures
  - Response validation and parsing

#### Integration Tests
- **Authentication flow** (`src/lib/__tests__/auth-flow.test.ts`)
  - Complete login/logout cycle
  - Session persistence across page reloads
  - Error recovery mechanisms

- **Route protection** (`src/lib/__tests__/route-protection.test.ts`)
  - Middleware authentication checks
  - Redirect logic for protected routes
  - Authentication state synchronization

#### Component Tests
- **Error handling** (`src/components/__tests__/error-handling.test.tsx`)
  - Form validation error display
  - Network error recovery
  - User interaction error scenarios

### Test Configuration

Tests use Vitest with jsdom environment:
- **Setup**: `src/test/setup.ts` configures Testing Library
- **Aliases**: Path aliases match Next.js configuration
- **Globals**: Global test utilities and matchers
- **Coverage**: Comprehensive coverage reporting

## 🎨 Styling and Theming

### Tailwind CSS v4

The project uses Tailwind CSS v4 with modern features:
- **OKLCH Color Space**: More perceptually uniform colors
- **CSS Custom Properties**: Dynamic theming support
- **Mobile-First Design**: Responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)
- **Performance**: Optimized CSS output with unused style purging

### Component Styling

- **shadcn/ui Components**: Pre-built, accessible UI primitives
  - Button variants (default, outline, ghost)
  - Input with validation states and focus indicators
  - Label with proper accessibility attributes

- **Custom Styling**: Enhanced UX and accessibility
  - Loading states with spinners
  - Error states with color-coded messages
  - Focus indicators meeting WCAG contrast requirements

### Design System

```css
/* Color Palette (OKLCH) */
--primary: oklch(47.78% 0.111 238.66);
--secondary: oklch(84.71% 0.0054 238.66);
--accent: oklch(74.51% 0.167 183.61);
--destructive: oklch(65.69% 0.196 22.73);

/* Typography Scale */
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)

/* Spacing Scale */
space-2: 0.5rem (8px)
space-4: 1rem (16px)
space-6: 1.5rem (24px)
```

## ♿ Accessibility Features

- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: Proper ARIA labels and live regions
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Reduced Motion**: Respects user's motion preferences
- **Touch Targets**: Minimum 44px touch targets on mobile devices

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js config
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:ui      # Run tests with interactive UI
```

### Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - Runs on `http://localhost:3000`
   - Hot reload with Turbopack
   - TypeScript type checking

2. **Run Tests During Development**:
   ```bash
   npm run test
   ```
   - Watch mode for instant feedback
   - Coverage reporting
   - Interactive test filtering

3. **Lint Code**:
   ```bash
   npm run lint
   ```
   - ESLint with Next.js rules
   - TypeScript-aware linting
   - Accessibility rule checking

### Code Quality Standards

- **TypeScript Configuration**:
  - Strict mode enabled (`strict: true`)
  - No implicit any (`noImplicitAny: true`)
  - Unused variable detection (`noUnusedLocals: true`)
  - Exact optional properties (`exactOptionalPropertyTypes: true`)

- **ESLint Rules**:
  - Next.js recommended configuration
  - React hooks rules
  - Accessibility linting (eslint-plugin-jsx-a11y)
  - TypeScript-specific rules

- **File Organization**:
  - Barrel exports (`index.ts` files)
  - Consistent naming conventions
  - Separation of concerns (components, utilities, types)

## 🚀 Deployment

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications:

#### Automatic Deployment
1. **Connect Repository**:
   - Link your GitHub/GitLab/Bitbucket repository to Vercel
   - Import project at [vercel.com/new](https://vercel.com/new)

2. **Configure Project**:
   ```bash
   # Build Command (auto-detected)
   npm run build
   
   # Output Directory (auto-detected)
   .next
   
   # Install Command (auto-detected)
   npm install
   ```

3. **Environment Variables** (if needed):
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   ```

4. **Deploy**:
   - Automatic deployments on every push to main branch
   - Preview deployments for pull requests
   - Custom domains and SSL certificates

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Deploy to production
vercel --prod
```

### Alternative Platforms

#### Netlify
```bash
# Build settings
Build command: npm run build
Publish directory: .next
```

#### Railway
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/"
  }
}
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build Configuration

The application uses Next.js 15 with:
- **App Router**: Modern routing system
- **Turbopack**: Fast bundler for development and production
- **Static Optimization**: Automatic static generation where possible
- **Image Optimization**: Built-in image optimization
- **Font Optimization**: Automatic font loading optimization

### Performance Considerations

- **Bundle Size**: Optimized with tree shaking and code splitting
- **Core Web Vitals**: Optimized for LCP, FID, and CLS metrics
- **Caching**: Proper cache headers for static assets
- **Compression**: Gzip/Brotli compression enabled

## 🔒 Security Considerations

### Current Implementation (Demo/Development)
- **Client-Side Authentication**: localStorage-based session management
- **Input Validation**: Comprehensive validation for all user inputs
- **XSS Protection**: React's built-in XSS protection and sanitization
- **Type Safety**: TypeScript prevents many runtime security issues

### Production Recommendations
- **Server-Side Authentication**: Implement JWT tokens with httpOnly cookies
- **Content Security Policy**: Configure CSP headers to prevent XSS
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **HTTPS Only**: Ensure all traffic uses HTTPS in production
- **Session Management**: Use secure, httpOnly cookies instead of localStorage
- **Input Sanitization**: Server-side validation and sanitization
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

### Security Headers (Next.js)
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 🤝 Contributing

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone https://github.com/your-username/client-auth-app.git`
3. **Install dependencies**: `npm install`
4. **Create a feature branch**: `git checkout -b feature/amazing-feature`
5. **Make your changes** following the guidelines below
6. **Test your changes**: `npm run test && npm run lint`
7. **Commit changes**: `git commit -m 'feat: add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request** with a clear description

### Development Guidelines

#### Code Standards
- **TypeScript**: Use strict mode, no `any` types
- **Components**: Functional components with proper TypeScript props
- **Hooks**: Follow React hooks rules and patterns
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: WCAG 2.1 AA compliance required

#### Testing Requirements
- **Unit Tests**: All utility functions must have tests
- **Component Tests**: Test user interactions and edge cases
- **Integration Tests**: Test complete user flows
- **Coverage**: Maintain 90%+ test coverage

#### Commit Convention
Use conventional commits for clear history:
```bash
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

#### Pull Request Checklist
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles without errors
- [ ] Accessibility tested with screen reader
- [ ] Mobile responsiveness verified
- [ ] Documentation updated if needed

## 📚 API Documentation

### Authentication API

#### `fetchRandomUser()`
Fetches user data from RandomUser.me API for demo authentication.

```typescript
import { fetchRandomUser, ApiError } from '@/lib/api';

try {
  const user = await fetchRandomUser();
  console.log(user); // User object with name, email, picture
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
  }
}
```

**Returns**: `Promise<User>`
**Throws**: `ApiError` with specific error types and status codes

#### Authentication Utilities

```typescript
import { 
  saveUserToStorage, 
  getUserFromStorage, 
  clearUserFromStorage, 
  isAuthenticated,
  getAuthState 
} from '@/lib/auth';

// Save user data (throws on storage errors)
saveUserToStorage(userData);

// Get current user (returns null if not found/invalid)
const user = getUserFromStorage();

// Check authentication status
const isLoggedIn = isAuthenticated();

// Get complete auth state
const { isAuthenticated, user } = getAuthState();

// Clear user data (throws on storage errors)
clearUserFromStorage();
```

#### Validation Utilities

```typescript
import { validateIranianPhone } from '@/lib/validation';

// Validate Iranian mobile number formats
const isValid = validateIranianPhone('09123456789'); // true
const isValid = validateIranianPhone('+989123456789'); // true
const isValid = validateIranianPhone('00989123456789'); // true
const isValid = validateIranianPhone('123456789'); // false
```

### Type Definitions

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

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

#### Test Failures
```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Run specific test file
npm run test -- auth.test.ts

# Clear test cache
npm run test -- --clearCache
```

#### Development Server Issues
```bash
# Check port availability
lsof -ti:3000

# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Start with different port
npm run dev -- --port 3001
```

### Browser Compatibility

#### localStorage Issues
- **Private/Incognito Mode**: localStorage may be disabled
- **Storage Quota**: Clear browser data if quota exceeded
- **Safari**: May block localStorage in some configurations

#### Network Errors
- **CORS**: RandomUser API allows cross-origin requests
- **Ad Blockers**: May block external API calls
- **Network Restrictions**: Corporate firewalls may block API

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

#### Lighthouse Audit
- Run Lighthouse in Chrome DevTools
- Focus on Core Web Vitals (LCP, FID, CLS)
- Check accessibility score (should be 100)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **shadcn/ui**: For the beautiful, accessible component library
- **RandomUser API**: For providing mock user data
- **Vercel**: For the excellent deployment platform

## 📚 Additional Documentation

- **[API Documentation](docs/API.md)** - Detailed API reference and usage examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions for various platforms
- **[Development Guide](docs/DEVELOPMENT.md)** - Comprehensive development workflow and best practices

## 📞 Support

For support, please:
- Check the [troubleshooting section](docs/DEVELOPMENT.md#troubleshooting) in the development guide
- Review the [API documentation](docs/API.md) for implementation details
- Open an issue in the GitHub repository with detailed information
- Contact the development team for urgent matters

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with Iranian mobile authentication
- Complete Next.js 15 implementation with App Router
- Comprehensive test suite with 90%+ coverage
- Full accessibility compliance (WCAG 2.1 AA)
- Production-ready deployment configurations

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS v4**