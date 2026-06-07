import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'year';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const now = new Date();
    let startDate: Date;

    if (from && to) {
      const parsedFrom = new Date(from);
      if (isNaN(parsedFrom.getTime())) {
        return NextResponse.json({ error: 'Date de début invalide' }, { status: 400 });
      }
      startDate = parsedFrom;
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), q * 3, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    let endDate: Date;
    if (to) {
      const parsedTo = new Date(to + 'T23:59:59');
      if (isNaN(parsedTo.getTime())) {
        return NextResponse.json({ error: 'Date de fin invalide' }, { status: 400 });
      }
      endDate = parsedTo;
    } else {
      endDate = now;
    }

    const whereBase = {
      userId: session.userId,
      createdAt: { gte: startDate, lte: endDate },
    };

    // Use aggregate for summary stats instead of loading all docs
    const [aggregated, typeGroup, statusGroup, monthlyAgg, docsWithClient] = await Promise.all([
      prisma.document.aggregate({
        where: whereBase,
        _sum: { totalTTC: true, tvaAmount: true },
        _count: true,
      }),
      prisma.document.groupBy({
        by: ['type'],
        where: whereBase,
        _count: { type: true },
        _sum: { totalTTC: true },
      }),
      prisma.document.groupBy({
        by: ['status'],
        where: whereBase,
        _count: { status: true },
      }),
      prisma.document.groupBy({
        by: ['createdAt'],
        where: whereBase,
        _sum: { totalTTC: true, tvaAmount: true },
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.document.findMany({
        where: whereBase,
        select: { totalTTC: true, client: { select: { id: true, name: true } } },
        take: 500,
      }),
    ]);

    const totalRevenue = aggregated._sum.totalTTC || 0;
    const totalTVA = aggregated._sum.tvaAmount || 0;
    const totalCount = aggregated._count;
    const avgInvoice = totalCount > 0 ? totalRevenue / totalCount : 0;

    // Group by month
    const monthlyData: Record<string, { revenue: number; count: number; tva: number }> = {};
    for (const d of monthlyAgg) {
      const key = d.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[key]) monthlyData[key] = { revenue: 0, count: 0, tva: 0 };
      monthlyData[key].revenue += d._sum.totalTTC || 0;
      monthlyData[key].count += d._count;
      monthlyData[key].tva += d._sum.tvaAmount || 0;
    }

    // Group by type
    const byType = typeGroup.map(row => ({
      type: row.type,
      count: row._count.type,
      total: (row._sum.totalTTC || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 }),
    }));

    // Group by status
    const byStatus = statusGroup.map(row => ({
      status: row.status,
      count: row._count.status,
    }));

    // Top clients
    const clientMap: Record<string, { name: string; count: number; total: number }> = {};
    for (const d of docsWithClient) {
      const cid = d.client?.id || 'unknown';
      const cname = d.client?.name || 'Sans client';
      if (!clientMap[cid]) clientMap[cid] = { name: cname, count: 0, total: 0 };
      clientMap[cid].count += 1;
      clientMap[cid].total += d.totalTTC;
    }
    const topClients = Object.values(clientMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalRevenue: totalRevenue.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalTVA: totalTVA.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalCount,
        avgInvoice: avgInvoice.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      monthly: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue.toLocaleString('fr-DZ', { minimumFractionDigits: 2 }),
        count: data.count,
        tva: data.tva,
      })),
      byType,
      byStatus,
      topClients,
    });
  } catch (error) {
    logger.error('GET /api/reports error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
