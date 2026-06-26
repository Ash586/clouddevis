import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { suspended: true, suspendedAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Compte introuvable', deleted: true }, { status: 401 });
    }
    if (user.suspended) {
      return NextResponse.json({
        error: 'Compte suspendu', suspended: true, suspendedAt: user.suspendedAt,
      }, { status: 403 });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    logger.error('GET /api/auth/me', { error: String(error) });
    throw error;
  }
}), { component: 'auth', severity: 'high', userImpact: 'blocking' });
