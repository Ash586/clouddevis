import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'clouddevis-dev-secret-key-change-in-production');
const COOKIE_NAME = 'session';

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
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

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
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      mode: (payload.mode as string) || 'artisan',
      sector: (payload.sector as string) || null,
      country: (payload.country as string) || 'algeria',
      language: (payload.language as string) || 'fr',
      subscriptionStatus: (payload.subscriptionStatus as string) || 'TRIAL',
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
