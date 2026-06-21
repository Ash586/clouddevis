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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const country = searchParams.get('country') || '';
    const suspended = searchParams.get('suspended');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.subscriptionStatus = status.toUpperCase();
    if (country) where.country = country;
    if (suspended === 'true') where.suspended = true;
    if (suspended === 'false') where.suspended = false;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true, country: true, mode: true,
          subscriptionStatus: true, trialStartAt: true, createdAt: true,
          suspended: true,
          _count: { select: { documents: true, clients: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id, name: u.name, email: u.email, country: u.country, mode: u.mode,
        subscription: u.subscriptionStatus, trialStartAt: u.trialStartAt,
        suspended: u.suspended,
        docCount: u._count.documents, clientCount: u._count.clients,
        createdAt: u.createdAt.toISOString().split('T')[0],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Admin users error', { error: String(error) });
    throw error;
  }
}
