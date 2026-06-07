import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/** Lazy JWT secrets – only computed when needed (safe if env vars missing at module load). */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}
function getAdminSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || '');
}

const PROTECTED_ROUTES = ['/dashboard', '/editor'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];
const COOKIE_NAME = 'session';
const ADMIN_COOKIE = 'admin_session';

/** API paths that don't require authentication. */
function isPublicApiPath(pathname: string): boolean {
  return (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password' ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/setup-admin' ||
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

  // Detect and set locale cookie if missing
  const locale = detectLocale(req);
  const res = NextResponse.next();
  if (!req.cookies.has('NEXT_LOCALE')) {
    res.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 365 * 24 * 60 * 60 });
  }

  // Allow public assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico' || pathname === '/favicon.svg') {
    return res;
  }

  // Admin route protection
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
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // API routes: require auth except public endpoints
  if (pathname.startsWith('/api')) {
    if (isPublicApiPath(pathname)) return res;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return res;
  }

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
      // Token expired/invalid
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
