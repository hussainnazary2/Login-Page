import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle route protection and authentication redirects
 * This runs on the server before pages are rendered
 * 
 * Note: Since we're using localStorage for client-side authentication,
 * this middleware primarily serves as a foundation for future server-side
 * session management. Currently, route protection is handled client-side.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log route access for debugging (can be removed in production)
  console.log(`Middleware: ${request.method} ${pathname}`);
  
  // Future enhancement: Add server-side session validation here
  // For now, allow all requests to proceed - client-side handles auth
  
  // Add security headers
  const response = NextResponse.next();
  
  // Add basic security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

/**
 * Configure which routes this middleware should run on
 * Currently set to run on dashboard routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};