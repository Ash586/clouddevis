import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createAdminSession } from '@/lib/adminAuth';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    const { email, password, redirect } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const ip = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const rateCheck = await checkRateLimit(`admin:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      try {
        await prisma.activityLog.create({
          data: {
            action: 'LOGIN_FAILED',
            entity: 'ADMIN',
            details: { reason: 'rate_limited', emailHash: simpleHash(String(email)), ip: String(ip).substring(0, 50) },
            ipAddress: String(ip).substring(0, 50),
          },
        });
      } catch {
        logger.warn('Failed to log rate-limited login attempt');
      }
      return NextResponse.json({ error: 'rate_limited', message: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      try {
        await prisma.activityLog.create({
          data: {
            action: 'LOGIN_FAILED',
            entity: 'ADMIN',
            details: { reason: 'not_found', emailHash: simpleHash(String(email)), ip: String(ip).substring(0, 50), userAgent },
            ipAddress: String(ip).substring(0, 50),
          },
        });
      } catch {
        logger.warn('Failed to log failed login attempt');
      }
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      try {
        await prisma.activityLog.create({
          data: {
            action: 'LOGIN_FAILED',
            entity: 'ADMIN',
            adminId: admin.id,
            details: { reason: 'invalid_password', emailHash: simpleHash(String(email)), ip: String(ip).substring(0, 50), userAgent },
            ipAddress: String(ip).substring(0, 50),
          },
        });
      } catch {
        logger.warn('Failed to log failed login attempt');
      }
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    await prisma.admin.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });

    await createAdminSession({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });

    try {
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN',
          entity: 'ADMIN',
          entityId: admin.id,
          details: { emailHash: simpleHash(String(email)), ip: String(ip).substring(0, 50), userAgent },
          ipAddress: String(ip).substring(0, 50),
        },
      });
    } catch {
      logger.warn('Failed to log successful admin login');
    }

    const safeRedirect = redirect && typeof redirect === 'string' && redirect.startsWith('/admin') ? redirect : '/admin';

    return NextResponse.json({ success: true, redirect: safeRedirect, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (error) {
    logger.error('Admin login error', { error: String(error) });
    throw error;
  }
}
