import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const SESSION_COOKIE = 'session';
const BCRYPT_ROUNDS = 10;

function getSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  mode: string;
  sector: string | null;
  country: string;
  language: string;
  subscriptionStatus: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a JWT, persists the session to DB, and returns the token + maxAge.
 * The CALLER is responsible for setting the cookie on the NextResponse — do NOT
 * use next/headers here; it is unreliable when called from nested async functions
 * in Next.js 16 Route Handlers.
 */
export async function createSession(
  user: {
    id: string;
    email: string;
    name: string;
    mode: string;
    sector: string | null;
    country: string;
    language: string;
    subscriptionStatus: string;
  },
  rememberMe = false,
): Promise<{ token: string; maxAge: number }> {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  const expiry = rememberMe ? '30d' : '7d';

  const jti =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    mode: user.mode,
    sector: user.sector,
    country: user.country,
    language: user.language,
    subscriptionStatus: user.subscriptionStatus,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiry)
    .setIssuedAt()
    .setJti(jti)
    .sign(getSecret());

  const { prisma } = await import('@/lib/prisma');
  await prisma.session.create({
    data: {
      userId: user.id,
      jti,
      expiresAt: new Date(Date.now() + maxAge * 1000),
    },
  });

  return { token, maxAge };
}

/**
 * Apply the session cookie to any NextResponse (json or redirect).
 * Call this immediately after createSession().
 */
export function applySessionCookie(
  response: NextResponse,
  token: string,
  maxAge: number,
): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
  return response;
}

export async function getSession(): Promise<(SessionUser & { jti?: string }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      mode: (payload.mode as string) || 'artisan',
      sector: (payload.sector as string) || null,
      country: (payload.country as string) || 'algeria',
      language: (payload.language as string) || 'fr',
      subscriptionStatus: (payload.subscriptionStatus as string) || 'TRIAL',
      jti: payload.jti as string | undefined,
    };
  } catch {
    return null;
  }
}

/** Revoke session in DB. Returns the cookie name so the caller can delete it on the response. */
export async function clearSession(): Promise<string> {
  const session = await getSession();
  if (session?.jti) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.session.deleteMany({ where: { jti: session.jti } });
    } catch { /* non-fatal — cookie is still cleared */ }
  }
  return SESSION_COOKIE;
}

export async function revokeAllSessions(userId: string): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  await prisma.session.deleteMany({ where: { userId } });
}

export async function getActiveSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const { prisma } = await import('@/lib/prisma');

  if (session.jti) {
    const dbSession = await prisma.session.findUnique({
      where: { jti: session.jti },
      select: { id: true, expiresAt: true },
    });
    if (!dbSession || dbSession.expiresAt < new Date()) return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { suspended: true },
  });

  if (user?.suspended) return null;

  const { jti: _jti, ...sessionUser } = session;
  return sessionUser;
}

export async function isUserSuspended(userId: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspended: true },
  });
  return user?.suspended ?? false;
}

// ─── Centralized auth middleware ───
import { NextRequest } from 'next/server';
import { requireCsrf } from '@/lib/csrf';

type AuthenticatedHandler = (
  req: NextRequest,
  session: SessionUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
) => Promise<Response> | Response;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth(handler: AuthenticatedHandler): any {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    requireCsrf(req);
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, session, ctx);
  };
}

type AdminHandler = (
  req: NextRequest,
  admin: { adminId: string; email: string; role: string; name: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx?: any,
) => Promise<Response> | Response;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAdminAuth(handler: AdminHandler): any {
  return async (req: NextRequest, ctx?: any) => {
    requireCsrf(req);
    const { getAdminSession } = await import('@/lib/adminAuth');
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, admin, ctx);
  };
}
