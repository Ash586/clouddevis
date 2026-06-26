import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAdminAuth(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';

    const now = new Date();
    let startDate: Date;
    if (period === '7d') startDate = new Date(now.getTime() - 7 * 86400000);
    else if (period === '90d') startDate = new Date(now.getTime() - 90 * 86400000);
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);
    else startDate = new Date(now.getTime() - 30 * 86400000);

    const [
      userGrowth,
      docTrend,
      countryBreakdown,
      topUsers,
      systemMetrics,
      docStatusBreakdown,
      visitorStats,
      topPages,
      conversionData,
    ] = await Promise.all([
      // Users created per day
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, country: true, mode: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Documents created per day
      prisma.document.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, type: true, totalTTC: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Users by country
      prisma.user.groupBy({
        by: ['country'],
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
      // Top users by doc count
      prisma.user.findMany({
        where: { documents: { some: { createdAt: { gte: startDate } } } },
        select: {
          id: true, name: true, email: true,
          _count: { select: { documents: true } },
        },
        orderBy: { documents: { _count: 'desc' } },
        take: 10,
      }),
      // System metrics over time
      prisma.systemMetric.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'asc' },
        take: 90,
      }),
      // Document status breakdown
      prisma.document.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      // Visitor stats
      prisma.pageView.aggregate({
        where: { timestamp: { gte: startDate } },
        _count: { id: true },
      }),
      // Top pages
      prisma.pageView.groupBy({
        by: ['path'],
        where: { timestamp: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Conversion data (total users vs paid users)
      prisma.user.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),
    ]);

    // Aggregate daily user growth
    const dailyUsers: Record<string, { count: number; artisans: number; enterprises: number }> = {};
    for (const u of userGrowth) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (!dailyUsers[key]) dailyUsers[key] = { count: 0, artisans: 0, enterprises: 0 };
      dailyUsers[key].count++;
      if (u.mode === 'ARTISAN') dailyUsers[key].artisans++;
      else dailyUsers[key].enterprises++;
    }

    // Aggregate daily doc trends
    const dailyDocs: Record<string, { count: number; revenue: number }> = {};
    for (const d of docTrend) {
      const key = d.createdAt.toISOString().slice(0, 10);
      if (!dailyDocs[key]) dailyDocs[key] = { count: 0, revenue: 0 };
      dailyDocs[key].count++;
      dailyDocs[key].revenue += d.totalTTC || 0;
    }

    // Aggregate system metrics
    const metricsByDate: Record<string, { users: number; docs: number; revenue: number }> = {};
    for (const m of systemMetrics) {
      const key = m.timestamp.toISOString().slice(0, 10);
      if (!metricsByDate[key] || m.timestamp > new Date(key + 'T23:59:59.999Z')) {
        metricsByDate[key] = { users: m.totalUsers, docs: m.totalDocuments, revenue: m.totalRevenue };
      }
    }

    // Unique sessions
    const uniqueSessions = await prisma.pageView.findMany({
      where: { timestamp: { gte: startDate } },
      select: { sessionId: true },
    });
    const uniqueSessionCount = new Set(uniqueSessions.map((s: { sessionId: string | null }) => s.sessionId).filter(Boolean) as string[]).size;

    // Paid users in period
    const paidUsersInPeriod = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        subscriptionStatus: { in: ['STANDARD', 'PRO', 'MAX'] },
      },
    });

    return NextResponse.json({
      userGrowth: Object.entries(dailyUsers).map(([date, data]) => ({ date, ...data })),
      docTrend: Object.entries(dailyDocs).map(([date, data]) => ({ date, ...data })),
      countryBreakdown: countryBreakdown.map((c: { country: string; _count: number }) => ({ country: c.country, count: c._count })),
      topUsers: topUsers.map((u: { id: string; name: string; email: string; _count: { documents: number } }) => ({
        id: u.id, name: u.name, email: u.email,
        docCount: u._count.documents,
      })),
      systemMetrics: Object.entries(metricsByDate).map(([date, data]) => ({ date, ...data })),
      docStatusBreakdown: docStatusBreakdown.map((d: { status: string; _count: number }) => ({ status: d.status, count: d._count })),
      visitorStats: {
        totalPageViews: visitorStats._count.id,
        uniqueSessions: uniqueSessionCount,
        avgPageViewsPerSession: uniqueSessionCount > 0 ? Math.round(visitorStats._count.id / uniqueSessionCount) : 0,
      },
      topPages: topPages.map((p: { path: string; _count: { id: number } }) => ({ path: p.path, count: p._count.id })),
      conversion: {
        totalUsersInPeriod: conversionData._count.id,
        paidUsersInPeriod,
        conversionRate: conversionData._count.id > 0 ? Math.round((paidUsersInPeriod / conversionData._count.id) * 100) : 0,
      },
      period,
    });
  } catch (error) {
    logger.error('Admin analytics error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
