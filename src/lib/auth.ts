import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'session';

/** Lazy getter for JWT secret – only throws when actually used (safe at build time). */
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
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: string; email: string; name: string; mode: string; sector: string | null; country: string; language: string; subscriptionStatus: string }, rememberMe = false) {
  const expiry = rememberMe ? '30d' : '7d';
  const maxAgeSec = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

  // Use crypto.randomUUID as a unique JWT ID for revocation
  const jti = typeof crypto !== 'undefined' && crypto.randomUUID
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

  // Persist session to DB for revocation support
  const { prisma } = await import('@/lib/prisma');
  await prisma.session.create({
    data: {
      userId: user.id,
      jti,
      expiresAt: new Date(Date.now() + maxAgeSec * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSec,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<(SessionUser & { jti?: string }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
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

export async function clearSession() {
  const cookieStore = await cookies();
  const session = await getSession();

  // Revoke session in DB if jti is present
  if (session?.jti) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.session.deleteMany({ where: { jti: session.jti } });
    } catch { /* non-fatal — cookie is still cleared */ }
  }

  cookieStore.delete(COOKIE_NAME);
}

/** Revoke all active sessions for a user (e.g. after password change). */
export async function revokeAllSessions(userId: string): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  await prisma.session.deleteMany({ where: { userId } });
}

/** Get session, verify it is not revoked, and verify user is not suspended. */
export async function getActiveSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const { prisma } = await import('@/lib/prisma');

  // Check DB session exists (revocation check) — only for sessions with jti
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

  // Strip internal jti before returning to callers
  const { jti: _jti, ...sessionUser } = session;
  return sessionUser;
}

/** Check if a user is suspended by ID */
export async function isUserSuspended(userId: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspended: true },
  });
  return user?.suspended ?? false;
}

// ─── Centralized auth middleware ───
import { NextRequest, NextResponse } from 'next/server';
import { requireCsrf } from '@/lib/csrf';

type AuthenticatedHandler = (
  req: NextRequest,
  session: SessionUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
) => Promise<Response> | Response;

/**
 * Wraps a route handler with centralized auth checks.
 * Returns 401 if not authenticated.
 *
 * Usage:
 *   export const GET = withAuth(async (req, session) => { ... });
 *   export const POST = withAuth(async (req, session) => { ... });
 */
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

/** Same as withAuth but for admin routes (uses ADMIN_JWT_SECRET). */
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
