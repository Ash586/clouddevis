import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET environment variable is required');
  return new TextEncoder().encode(secret);
}

const ADMIN_COOKIE = 'admin_session';

export interface AdminUser {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(admin: { id: string; email: string; name: string; role: string }) {
  const maxAgeSeconds = parseInt(process.env.ADMIN_SESSION_MAX_AGE_SECONDS || '', 10) || (12 * 60 * 60);
  const expirySeconds = maxAgeSeconds;
  const expiryHours = Math.max(1, Math.floor(expirySeconds / 3600));
  const expiry = `${expiryHours}h`;

  const token = await new SignJWT({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiry)
    .setIssuedAt()
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expirySeconds,
    path: '/',
  });

  return token;
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
