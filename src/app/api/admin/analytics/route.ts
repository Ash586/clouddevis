import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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

    return NextResponse.json({
      userGrowth: Object.entries(dailyUsers).map(([date, data]) => ({ date, ...data })),
      docTrend: Object.entries(dailyDocs).map(([date, data]) => ({ date, ...data })),
      countryBreakdown: countryBreakdown.map(c => ({ country: c.country, count: c._count })),
      topUsers: topUsers.map(u => ({
        id: u.id, name: u.name, email: u.email,
        docCount: u._count.documents,
      })),
      systemMetrics: Object.entries(metricsByDate).map(([date, data]) => ({ date, ...data })),
      docStatusBreakdown: docStatusBreakdown.map(d => ({ status: d.status, count: d._count })),
      period,
    });
  } catch (error) {
    logger.error('Admin analytics error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
