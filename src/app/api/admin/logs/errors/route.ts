import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAdminAuth(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where = { action: 'ERROR' };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: { select: { name: true, email: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        details: l.details,
        ipAddress: l.ipAddress,
        adminName: l.admin?.name || null,
        userName: l.user?.name || null,
        createdAt: l.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error logs fetch error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
