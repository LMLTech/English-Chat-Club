import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get role from cookie (set by zustand store)
  const role = request.cookies.get('ecc_role')?.value;

  // Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      // If not admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Moderator Routes (Both Admin and Moderator can access)
  if (pathname.startsWith('/moderator')) {
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Main Routes (Must be logged in)
  // If user tries to access /dashboard, /sessions, etc. without ANY role, redirect to /login
  const protectedPaths = ['/dashboard', '/sessions', '/forum', '/messages', '/profile', '/rewards', '/support', '/friends', '/leaderboard'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from Auth pages
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authPaths.some(path => pathname.startsWith(path)) && role) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Config to specify which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
