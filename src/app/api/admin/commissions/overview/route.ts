import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAdminAuth(async (req, session) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPartners,
      activePartners,
      pendingPartners,
      totalCommissions,
      monthlyCommissions,
      pendingPayouts,
      pendingPayoutsCount,
      totalPayouts,
      topPartners,
    ] = await Promise.all([
      prisma.partner.count(),
      prisma.partner.count({ where: { status: 'ACTIVE' } }),
      prisma.partner.count({ where: { status: 'PENDING' } }),
      prisma.commission.aggregate({ _sum: { amount: true } }),
      prisma.commission.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { totalAmount: true },
      }),
      prisma.payout.count({ where: { status: 'PENDING' } }),
      prisma.payout.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.partner.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { commissions: true, referrals: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalPartners,
        activePartners,
        pendingPartners,
        totalCommissions: totalCommissions._sum.amount || 0,
        monthlyCommissions: monthlyCommissions._sum.amount || 0,
        pendingPayouts: pendingPayouts._sum.totalAmount || 0,
        pendingPayoutsCount,
        totalPayouts: totalPayouts._sum.totalAmount || 0,
      },
      topPartners: topPartners.map(p => ({
        id: p.id,
        code: p.code,
        tier: p.tier,
        user: p.user,
        referralCount: p._count.referrals,
        commissionCount: p._count.commissions,
      })),
    });
  } catch (error) {
    logger.error('Admin commissions overview error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
