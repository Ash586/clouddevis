import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local.substring(0, 2) + '***';
  return `${masked}@${domain}`;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      include: {
        _count: { select: { referrals: true, commissions: true, clicks: true } },
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
        take: 10,
      }),
    ]);

    const recentReferralsRaw = await prisma.referral.findMany({
      where: { partnerId: partner.id },
      take: 10,
      orderBy: { convertedAt: 'desc' },
    });

    const referredUserIds = recentReferralsRaw.map(r => r.referredUserId);
    const referredUsers = await prisma.user.findMany({
      where: { id: { in: referredUserIds } },
      select: { id: true, email: true },
    });
    const userEmailMap = new Map(referredUsers.map(u => [u.id, u.email]));

    const childrenCount = await prisma.partner.count({ where: { parentId: partner.id } });

    const conversionRate = totalReferrals > 0 ? Math.round((convertedReferrals / totalReferrals) * 100) : 0;
    const clickCount = partner._count.clicks || 0;
    const minimumPayout = 2000;
    const pendingAmount = pendingCommissions._sum.amount || 0;
    const nextPayoutAvailable = pendingAmount >= minimumPayout;

    return NextResponse.json({
      partner: {
        id: partner.id,
        code: partner.code,
        tier: partner.tier,
        status: partner.status,
        parent: partner.parent,
      },
      stats: {
        clicks: clickCount,
        totalReferrals,
        convertedReferrals,
        conversionRate,
        childrenCount,
        totalCommissions: totalCommissions._sum.amount || 0,
        pendingCommissions: pendingAmount,
        paidCommissions: paidCommissions._sum.amount || 0,
        commissionRate: partner.tier === 'SUPER_AFFILIATE' ? 25 : 20,
        minimumPayout,
        nextPayoutAvailable,
      },
      recentReferrals: recentReferralsRaw.map(r => ({
        id: r.id,
        maskedEmail: maskEmail(userEmailMap.get(r.referredUserId) || 'unknown@unknown'),
        status: r.status,
        createdAt: (r.convertedAt || new Date()).toISOString().split('T')[0],
      })),
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
