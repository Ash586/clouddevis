import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ── Rate limiting ─────────────────────────────────────────────
// Tiered limits applied in middleware so all 70+ routes are covered.
// Upstash Redis is used when env vars are set (shared across Edge instances).
// Falls back to per-instance in-memory Map (dev / single-instance only).

type RateTier = { max: number; windowMs: number };

const TIERS: Record<string, RateTier> = {
  critical:   { max: 5,   windowMs: 60_000 },  // export, oauth-callback, track
  auth:       { max: 10,  windowMs: 60_000 },  // login, register (already limited in routes)
  write:      { max: 60,  windowMs: 60_000 },  // POST/PUT/DELETE to data routes
  read:       { max: 200, windowMs: 60_000 },  // GET to data routes
  admin:      { max: 30,  windowMs: 60_000 },  // admin panel
};

function getTier(pathname: string, method: string): RateTier {
  if (
    pathname.startsWith('/api/export') ||
    pathname.startsWith('/api/auth/oauth/callback') ||
    pathname === '/api/track/pageview' ||
    pathname.startsWith('/api/subscribe')
  ) return TIERS.critical;

  if (pathname.startsWith('/api/admin/')) return TIERS.admin;

  if (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password'
  ) return TIERS.auth;

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return TIERS.write;
  return TIERS.read;
}

// In-memory fallback (per Edge instance — use Upstash in production)
const memRL = new Map<string, { count: number; resetAt: number }>();

async function checkRL(key: string, tier: RateTier): Promise<boolean> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const windowKey = `rl:${key}:${Math.floor(Date.now() / tier.windowMs)}`;
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${upstashToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', windowKey], ['PEXPIRE', windowKey, tier.windowMs]]),
      });
      const results = await res.json();
      return (results[0]?.result ?? 1) <= tier.max;
    } catch { /* fall through to memory */ }
  }

  const now = Date.now();
  const entry = memRL.get(key);
  if (!entry || now > entry.resetAt) {
    if (memRL.size > 50_000) memRL.clear();
    memRL.set(key, { count: 1, resetAt: now + tier.windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= tier.max;
}

async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api/')) return null;

  const tier = getTier(pathname, req.method);
  const forwarded = req.headers.get('x-forwarded-for');
  const parts = forwarded ? forwarded.split(',').map(s => s.trim()).filter(Boolean) : [];
  const ip = parts[parts.length - 1] ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const key = `${pathname}:${ip}`;

  const allowed = await checkRL(key, tier);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  return null;
}

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
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/admin/login', '/admin'];
const COOKIE_NAME = 'session';
const ADMIN_COOKIE = 'admin_session';

function isPublicApiPath(pathname: string): boolean {
  return (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password' ||
    pathname === '/api/admin/auth/login' ||
    pathname.startsWith('/api/auth/oauth') ||
    pathname === '/api/track/pageview' ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/api/r/')
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

  const rateLimited = await applyRateLimit(req);
  if (rateLimited) return rateLimited;

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
    if (pathname.startsWith('/api/admin/')) {
      const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
      if (!adminToken) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      try {
        await jwtVerify(adminToken, getAdminSecret());
      } catch {
        return NextResponse.json({ error: 'Session admin expirée' }, { status: 401 });
      }
      return res;
    }
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
