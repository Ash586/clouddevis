import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function getHandler(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || '';
    const entity = searchParams.get('entity') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = action.toUpperCase();
    if (entity) where.entity = entity.toUpperCase();
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    if (search) {
      where.OR = [
        { entity: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { admin: { select: { name: true, email: true } }, user: { select: { name: true, email: true } } },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id, action: l.action, entity: l.entity, entityId: l.entityId,
        details: l.details, ipAddress: l.ipAddress,
        adminName: l.admin?.name, userName: l.user?.name,
        createdAt: l.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Admin logs error', { error: String(error) });
    throw error;
  }
}
