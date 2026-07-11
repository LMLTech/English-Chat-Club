import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get role from cookie (set by zustand store)
  const role = request.cookies.get('ecc_role')?.value;

  // Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
      // If not admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Moderator Routes (Both Admin and Moderator can access)
  if (pathname.startsWith('/moderator')) {
    const isAllowed = ['ADMIN', 'ROLE_ADMIN', 'MODERATOR', 'ROLE_MODERATOR'].includes(role || '');
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Main Routes (Must be logged in)
  const memberPaths = ['/dashboard', '/messages', '/profile', '/rewards', '/support', '/friends', '/sessions', '/forum', '/leaderboard', '/gamification', '/resources'];
  const isMemberPath = memberPaths.some(path => pathname.startsWith(path)) || pathname.match(/^\/sessions\/\d+\/room/);
  
  if (isMemberPath) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If Admin tries to access member path, redirect to admin dashboard (except /profile and /messages maybe? but let's be strict or let them use profile)
    // Actually, Admin has /admin/dashboard. Let's redirect if they try to access /dashboard specifically.
    if ((role === 'ADMIN' || role === 'ROLE_ADMIN') && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if ((role === 'MODERATOR' || role === 'ROLE_MODERATOR') && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/moderator/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from Auth pages
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authPaths.some(path => pathname.startsWith(path)) && role) {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (role === 'MODERATOR' || role === 'ROLE_MODERATOR') {
      return NextResponse.redirect(new URL('/moderator/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
