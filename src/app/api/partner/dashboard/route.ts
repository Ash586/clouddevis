import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      include: {
        _count: { select: { referrals: true, commissions: true } },
        parent: { select: { id: true, code: true, user: { select: { name: true } } } },
      },
    });

    if (!partner) return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    if (partner.status !== 'ACTIVE') return NextResponse.json({ error: 'Compte partenaire inactif' }, { status: 403 });

    const [totalCommissions, pendingCommissions, paidCommissions, totalReferrals, convertedReferrals, recentCommissions] = await Promise.all([
      prisma.commission.aggregate({ where: { partnerId: partner.id }, _sum: { amount: true } }),
      prisma.commission.aggregate({ where: { partnerId: partner.id, status: 'PENDING' }, _sum: { amount: true } }),
      prisma.commission.aggregate({ where: { partnerId: partner.id, status: 'PAID' }, _sum: { amount: true } }),
      prisma.referral.count({ where: { partnerId: partner.id } }),
      prisma.referral.count({ where: { partnerId: partner.id, status: 'CONVERTED' } }),
      prisma.commission.findMany({
        where: { partnerId: partner.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const childrenCount = await prisma.partner.count({ where: { parentId: partner.id } });

    const conversionRate = totalReferrals > 0 ? Math.round((convertedReferrals / totalReferrals) * 100) : 0;

    return NextResponse.json({
      partner: {
        id: partner.id,
        code: partner.code,
        tier: partner.tier,
        status: partner.status,
        parent: partner.parent,
      },
      stats: {
        totalReferrals,
        convertedReferrals,
        conversionRate,
        childrenCount,
        totalCommissions: totalCommissions._sum.amount || 0,
        pendingCommissions: pendingCommissions._sum.amount || 0,
        paidCommissions: paidCommissions._sum.amount || 0,
      },
      recentCommissions: recentCommissions.map(c => ({
        id: c.id,
        amount: c.amount,
        type: c.type,
        status: c.status,
        createdAt: c.createdAt.toISOString().split('T')[0],
      })),
    });
  } catch (error) {
    logger.error('Partner dashboard error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
