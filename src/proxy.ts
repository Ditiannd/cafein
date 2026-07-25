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

  // Only protect /admin and /barista routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isBaristaRoute = pathname.startsWith('/barista');

  if (!isAdminRoute && !isBaristaRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getJwtSecret();

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
  matcher: ['/admin/:path*', '/barista/:path*'],
};
