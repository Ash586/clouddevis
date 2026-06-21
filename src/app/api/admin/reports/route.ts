import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function getHandler(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'year';

    const now = new Date();
    let startDate: Date;
    if (period === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'quarter') { const q = Math.floor(now.getMonth() / 3); startDate = new Date(now.getFullYear(), q * 3, 1); }
    else startDate = new Date(now.getFullYear(), 0, 1);

    const where = { createdAt: { gte: startDate, lte: now } };

    const [userGrowth, docByType, subBreakdown, revenueAgg] = await Promise.all([
      prisma.user.groupBy({ by: ['createdAt'], where, _count: true, orderBy: { createdAt: 'asc' } }),
      prisma.document.groupBy({ by: ['type'], where, _count: { type: true }, _sum: { totalTTC: true } }),
      prisma.user.groupBy({ by: ['subscriptionStatus'], _count: true }),
      prisma.document.aggregate({ where, _sum: { totalTTC: true, tvaAmount: true }, _count: true }),
    ]);

    const monthlyUsers: Record<string, number> = {};
    for (const row of userGrowth) {
      const key = row.createdAt.toISOString().slice(0, 7);
      monthlyUsers[key] = (monthlyUsers[key] || 0) + row._count;
    }

    return NextResponse.json({
      revenue: {
        total: (revenueAgg._sum.totalTTC || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 }),
        tva: (revenueAgg._sum.tvaAmount || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 }),
        docCount: revenueAgg._count,
      },
      userGrowth: Object.entries(monthlyUsers).map(([month, count]) => ({ month, count })),
      docByType: docByType.map(r => ({ type: r.type, count: r._count.type, revenue: r._sum.totalTTC || 0 })),
      subscriptionBreakdown: subBreakdown.map(r => ({ status: r.subscriptionStatus, count: r._count })),
    });
  } catch (error) {
    logger.error('Admin reports error', { error: String(error) });
    throw error;
  }
}
