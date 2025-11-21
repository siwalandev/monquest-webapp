import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login, unauthorized, and auth APIs
  if (
    pathname === '/admin/login' || 
    pathname === '/admin/unauthorized' ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  // For now, let client-side handle auth check
  // Middleware will just pass through since we use localStorage not cookies
  // The admin layout component will handle redirect if not authenticated
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
  ],
};
