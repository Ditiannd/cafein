import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'cafeintoday_session';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle exact /admin redirect to /admin/overview
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/overview', request.url));
  }

  const isAuthRoute = pathname.startsWith('/auth/login');
  const isAdminRoute = pathname.startsWith('/admin');
  const isBaristaRoute = pathname.startsWith('/barista');

  if (!isAdminRoute && !isBaristaRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getJwtSecret();

  // If visiting login page while already authenticated, redirect to dashboard
  if (isAuthRoute) {
    if (token && secret) {
      try {
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/admin/overview', request.url));
        }
        return NextResponse.redirect(new URL('/barista', request.url));
      } catch {
        // Token invalid, proceed to login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  if (!token || !secret) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // RBAC: Baristas cannot access admin routes
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/barista', request.url));
    }

    // Both admin and barista can access barista routes
    return NextResponse.next();
  } catch {
    // Invalid token → redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/barista', '/barista/:path*', '/auth/login'],
};
