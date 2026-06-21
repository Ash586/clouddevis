import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'billing', severity: 'critical', userImpact: 'blocking' });
async function getHandler(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (status) where.subscriptionStatus = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { subscriptionEndAt: { sort: 'asc', nulls: 'last' } },
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true,
          subscriptionStatus: true, trialStartAt: true, subscriptionEndAt: true,
          createdAt: true,
          _count: { select: { documents: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const summary = await Promise.all([
      prisma.user.groupBy({ by: ['subscriptionStatus'], _count: true }),
      prisma.user.aggregate({ _count: true }),
    ]);

    const breakdown: Record<string, number> = {};
    for (const row of summary[0]) {
      breakdown[row.subscriptionStatus] = row._count;
    }

    return NextResponse.json({
      subscriptions: users.map(u => ({
        id: u.id, name: u.name, email: u.email,
        status: u.subscriptionStatus,
        trialStartAt: u.trialStartAt?.toISOString().split('T')[0] || null,
        subscriptionEndAt: u.subscriptionEndAt?.toISOString().split('T')[0] || null,
        docCount: u._count.documents,
        createdAt: u.createdAt.toISOString().split('T')[0],
      })),
      summary: {
        total: summary[1]._count,
        breakdown,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Admin subscriptions error', { error: String(error) });
    throw error;
  }
}
