import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'clouddevis-dev-secret-key-change-in-production');

const PROTECTED_ROUTES = ['/dashboard', '/editor'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];
const COOKIE_NAME = 'session';

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

  // Allow public assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static') || pathname === '/') {
    return res;
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

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
      // Token expired/invalid — treat as not logged in
    }
  }

  if (isProtected) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
