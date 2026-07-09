import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { hasPermission } from '@/lib/admin/permissions';
import type { FeedbackStatus, FeedbackType, Prisma } from '@prisma/client';

const VALID_STATUSES = ['NEW', 'REVIEWED', 'RESOLVED'];
const VALID_TYPES = ['SUGGESTION', 'BUG'];

export const GET = withApiErrorHandling(withAdminAuth(async (req, session) => {
  try {
    if (!hasPermission(session.role, 'feedback:read')) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: Prisma.FeedbackWhereInput = {};
    if (status && VALID_STATUSES.includes(status)) where.status = status as FeedbackStatus;
    if (type && VALID_TYPES.includes(type)) where.type = type as FeedbackType;

    const [items, counts] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.feedback.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const byStatus = { NEW: 0, REVIEWED: 0, RESOLVED: 0 } as Record<string, number>;
    for (const c of counts) byStatus[c.status] = c._count._all;

    return NextResponse.json({
      items: items.map(f => ({ ...f, createdAt: f.createdAt.toISOString() })),
      counts: byStatus,
    });
  } catch (error) {
    logger.error('Fetch feedback list', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
