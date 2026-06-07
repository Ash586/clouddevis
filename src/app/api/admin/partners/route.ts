import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const tier = searchParams.get('tier') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status.toUpperCase();
    if (tier) where.tier = tier.toUpperCase();
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, country: true, subscriptionStatus: true, createdAt: true } },
          parent: { select: { id: true, code: true, user: { select: { name: true } } } },
          _count: { select: { referrals: true, commissions: true, children: true } },
        },
      }),
      prisma.partner.count({ where }),
    ]);

    return NextResponse.json({
      partners: partners.map(p => ({
        id: p.id,
        code: p.code,
        tier: p.tier,
        status: p.status,
        user: p.user,
        parent: p.parent,
        referralCount: p._count.referrals,
        commissionCount: p._count.commissions,
        childrenCount: p._count.children,
        appliedAt: p.appliedAt.toISOString().split('T')[0],
        approvedAt: p.approvedAt?.toISOString().split('T')[0] || null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Admin partners list error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
