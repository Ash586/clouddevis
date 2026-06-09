import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsersThisMonth, usersToday, totalDocs, docsThisMonth, totalClients, activeTrialUsers, activeBasicUsers, activeProUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.document.count(),
      prisma.document.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.client.count(),
      prisma.user.count({ where: { subscriptionStatus: 'TRIAL' } }),
      prisma.user.count({ where: { subscriptionStatus: 'STANDARD' } }),
      prisma.user.count({ where: { subscriptionStatus: 'PRO' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, email: true, country: true, subscriptionStatus: true, createdAt: true, mode: true },
      }),
    ]);

    const docTypeBreakdown = await prisma.document.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsersThisMonth,
        usersToday,
        totalDocs,
        docsThisMonth,
        totalClients,
        activeTrialUsers,
        activeBasicUsers,
        activeProUsers,
      },
      docTypeBreakdown: docTypeBreakdown.map(r => ({ type: r.type, count: r._count.type })),
      recentUsers: recentUsers.map(u => ({
        id: u.id, name: u.name, email: u.email, country: u.country,
        subscription: u.subscriptionStatus, mode: u.mode,
        createdAt: u.createdAt.toISOString().split('T')[0],
      })),
    });
  } catch (error) {
    logger.error('Admin dashboard error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
