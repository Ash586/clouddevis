import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

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
}
