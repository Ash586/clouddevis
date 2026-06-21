import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const now = new Date();
    const memUsage = process.memoryUsage();
    const startTime = Date.now() - Math.floor(process.uptime() * 1000);

    const [
      totalUsers, totalDocs, totalClients, totalTemplates, totalAdmins,
      activeUsers, suspendedUsers,
      totalPageViews, todayPageViews,
      totalTeams, totalShares, totalRecurring,
      errorLogCount, loginLogCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.client.count(),
      prisma.template.count(),
      prisma.admin.count(),
      prisma.user.count({ where: { subscriptionStatus: { in: ['TRIAL', 'STANDARD', 'PRO', 'MAX'] } } }),
      prisma.user.count({ where: { suspended: true } }),
      prisma.pageView.count(),
      prisma.pageView.count({ where: { timestamp: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
      prisma.team.count(),
      prisma.documentShare.count(),
      prisma.recurringInvoice.count({ where: { active: true } }),
      prisma.activityLog.count({ where: { action: 'ERROR' } }),
      prisma.activityLog.count({ where: { action: 'LOGIN' } }),
    ]);

    // Get top visited pages
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Get recent errors
    const recentErrors = await prisma.activityLog.findMany({
      where: { action: 'ERROR' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { entity: true, entityId: true, details: true, createdAt: true },
    });

    return NextResponse.json({
      status: 'healthy',
      timestamp: now.toISOString(),
      uptime: Math.floor(process.uptime()),
      startedAt: new Date(startTime).toISOString(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      counts: {
        users: totalUsers,
        documents: totalDocs,
        clients: totalClients,
        templates: totalTemplates,
        admins: totalAdmins,
        activeUsers,
        suspendedUsers,
        teams: totalTeams,
        shares: totalShares,
        recurring: totalRecurring,
        pageViews: totalPageViews,
        todayPageViews,
      },
      activity: {
        errorCount: errorLogCount,
        loginCount: loginLogCount,
        topPages: topPages.map(p => ({ path: p.path, count: p._count.id })),
        recentErrors,
      },
      nodeVersion: process.version,
      platform: process.platform,
    });
  } catch (error) {
    logger.error('Admin system error', { error: String(error) });
    throw error;
  }
}
