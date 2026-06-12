import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}
function getAdminSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET or JWT_SECRET is required');
  return new TextEncoder().encode(secret);
}

const PROTECTED_ROUTES = ['/dashboard', '/editor'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/admin/login', '/admin'];
const COOKIE_NAME = 'session';
const ADMIN_COOKIE = 'admin_session';

function isPublicApiPath(pathname: string): boolean {
  return (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password' ||
    pathname === '/api/admin/auth/login' ||
    pathname.startsWith('/api/auth/oauth')
  );
}

const LOCALES = ['fr', 'ar', 'en'] as const;
const DEFAULT_LOCALE = 'fr';

function detectLocale(req: NextRequest): string {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie;
  const acceptLang = req.headers.get('accept-language') || '';
  for (const l of LOCALES) {
    if (acceptLang.startsWith(l)) return l;
  }
  return DEFAULT_LOCALE;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const locale = detectLocale(req);
  const res = NextResponse.next();
  if (!req.cookies.has('NEXT_LOCALE')) {
    res.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 365 * 24 * 60 * 60 });
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico' || pathname === '/favicon.svg') {
    return res;
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    try {
      await jwtVerify(adminToken, getAdminSecret());
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return res;
  }

  if (pathname.startsWith('/api')) {
    if (isPublicApiPath(pathname)) return res;
    if (pathname.startsWith('/api/admin/')) return res;
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    try {
      await jwtVerify(token, getSecret());
    } catch {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
    }
    return res;
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  if (token) {
    try {
      await jwtVerify(token, getSecret());
      if (isPublic) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return res;
    } catch {
      // Token expired/invalid — fall through
    }
  }

  if (isProtected || (!isPublic && pathname !== '/')) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/editor/:path*', '/admin/:path*', '/auth/:path*'],
};
