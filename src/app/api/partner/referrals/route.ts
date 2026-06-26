import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (_req, session) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      select: { id: true, status: true },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const referrals = await prisma.referral.findMany({
      where: { partnerId: partner.id },
      orderBy: { id: 'desc' },
      include: {
        referredUser: { select: { name: true, email: true, country: true, subscriptionStatus: true, createdAt: true } },
      },
    });

    return NextResponse.json({
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.referredUser.name,
        email: r.referredUser.email,
        country: r.referredUser.country,
        subscription: r.referredUser.subscriptionStatus,
        status: r.status,
        convertedAt: r.convertedAt?.toISOString().split('T')[0] || null,
        createdAt: r.referredUser.createdAt.toISOString().split('T')[0],
      })),
    });
  } catch (error) {
    logger.error('Partner referrals error', { error: String(error) });
    throw error;
  }
}), { component: 'api', severity: 'medium', userImpact: 'degraded' });
