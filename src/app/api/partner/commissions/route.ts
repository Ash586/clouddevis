import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'api', severity: 'medium', userImpact: 'degraded' });
async function getHandler() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      select: { id: true, status: true },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const [commissions, summary] = await Promise.all([
      prisma.commission.findMany({
        where: { partnerId: partner.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.commission.groupBy({
        by: ['type', 'status'],
        where: { partnerId: partner.id },
        _sum: { amount: true },
        _count: { amount: true },
      }),
    ]);

    return NextResponse.json({
      commissions: commissions.map(c => ({
        id: c.id,
        amount: c.amount,
        type: c.type,
        status: c.status,
        subscriptionId: c.subscriptionId,
        paidAt: c.paidAt?.toISOString().split('T')[0] || null,
        createdAt: c.createdAt.toISOString().split('T')[0],
      })),
      summary: summary.reduce((acc, s) => {
        const key = `${s.type}_${s.status}`;
        acc[key] = { amount: s._sum.amount || 0, count: s._count.amount };
        return acc;
      }, {} as Record<string, { amount: number; count: number }>),
    });
  } catch (error) {
    logger.error('Partner commissions error', { error: String(error) });
    throw error;
  }
}
