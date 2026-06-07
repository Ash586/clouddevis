import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'year';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const now = new Date();
  let startDate: Date;

  if (from && to) {
    startDate = new Date(from);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), q * 3, 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const endDate = to ? new Date(to + 'T23:59:59') : now;

  const whereBase = {
    userId: session.userId,
    createdAt: { gte: startDate, lte: endDate },
  };

  // Monthly revenue
  const allDocs = await prisma.document.findMany({
    where: whereBase,
    select: { totalTTC: true, tvaAmount: true, type: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const totalRevenue = allDocs.reduce((sum, d) => sum + d.totalTTC, 0);
  const totalTVA = allDocs.reduce((sum, d) => sum + d.tvaAmount, 0);
  const totalCount = allDocs.length;
  const avgInvoice = totalCount > 0 ? totalRevenue / totalCount : 0;

  // Group by month
  const monthlyData: Record<string, { revenue: number; count: number; tva: number }> = {};
  for (const d of allDocs) {
    const key = d.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[key]) monthlyData[key] = { revenue: 0, count: 0, tva: 0 };
    monthlyData[key].revenue += d.totalTTC;
    monthlyData[key].count += 1;
    monthlyData[key].tva += d.tvaAmount;
  }

  // Group by type
  const byType: Record<string, { count: number; total: number }> = {};
  for (const d of allDocs) {
    if (!byType[d.type]) byType[d.type] = { count: 0, total: 0 };
    byType[d.type].count += 1;
    byType[d.type].total += d.totalTTC;
  }

  // Group by status
  const byStatus: Record<string, number> = {};
  for (const d of allDocs) {
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
  }

  // Top clients
  const docsWithClient = await prisma.document.findMany({
    where: whereBase,
    select: { totalTTC: true, client: { select: { id: true, name: true } } },
  });
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
    byType: Object.entries(byType).map(([type, data]) => ({
      type, count: data.count,
      total: data.total.toLocaleString('fr-DZ', { minimumFractionDigits: 2 }),
    })),
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    topClients,
  });
}
