import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ADMIN_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);

const PROTECTED_ROUTES = ['/dashboard', '/editor'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];
const COOKIE_NAME = 'session';
const ADMIN_COOKIE = 'admin_session';

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
      await jwtVerify(adminToken, ADMIN_SECRET);
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // API routes: require auth except public endpoints
  if (pathname.startsWith('/api')) {
    const PUBLIC_API = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'];
    if (PUBLIC_API.includes(pathname)) return res;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return res;
  }

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  if (token) {
    try {
      await jwtVerify(token, SECRET);
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
