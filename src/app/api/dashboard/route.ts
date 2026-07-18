import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { TRIAL_DAYS } from '@/lib/subscription';

export const GET = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const ALL_TYPES = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE', 'INTERVENTION', 'ATTACHEMENT'] as const;

    const [totalDocs, monthDocs, totalClients, aggregated, typeGroup, statusGroup, draftCount, recentDraft, user, unpaidAgg, recentInvoices, topClientsGroup] = await Promise.all([
      prisma.document.count({ where: { userId: session.userId } }),
      prisma.document.count({ where: { userId: session.userId, createdAt: { gte: startOfMonth } } }),
      prisma.client.count({ where: { userId: session.userId } }),
      prisma.document.aggregate({
        where: { userId: session.userId },
        _sum: { totalTTC: true },
      }),
      prisma.document.groupBy({
        by: ['type'],
        where: { userId: session.userId },
        _count: { type: true },
      }),
      prisma.document.groupBy({
        by: ['status'],
        where: { userId: session.userId },
        _count: { status: true },
      }),
      prisma.document.count({ where: { userId: session.userId, status: 'DRAFT' } }),
      prisma.document.findFirst({
        where: { userId: session.userId, status: 'DRAFT' },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, number: true, type: true, updatedAt: true, client: { select: { name: true } } },
      }),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, mode: true, phone: true, companyInfo: true, trialStartAt: true, subscriptionEndAt: true, subscriptionStatus: true },
      }),
      prisma.document.aggregate({
        where: { userId: session.userId, type: 'FACTURE', status: 'SENT' },
        _sum: { totalTTC: true },
        _count: { _all: true },
      }),
      prisma.document.findMany({
        where: { userId: session.userId, type: 'FACTURE', date: { gte: sixMonthsAgo } },
        select: { date: true, totalTTC: true },
      }),
      prisma.document.groupBy({
        by: ['clientId'],
        where: { userId: session.userId, clientId: { not: null } },
        _sum: { totalTTC: true },
        _count: { _all: true },
        orderBy: { _sum: { totalTTC: 'desc' } },
        take: 3,
      }),
    ]);

    const totalTTC = aggregated._sum.totalTTC || 0;

    // ── Monthly revenue series (last 6 months, FACTURE TTC) ──
    const monthlyRevenue: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyRevenue.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, total: 0 });
    }
    for (const inv of recentInvoices) {
      const d = new Date(inv.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthlyRevenue.find((b) => b.month === key);
      if (bucket) bucket.total += inv.totalTTC || 0;
    }

    // ── Top clients by cumulative TTC ──
    const topClientIds = topClientsGroup.map((g) => g.clientId).filter((id): id is string => id !== null);
    const topClientRecords = topClientIds.length
      ? await prisma.client.findMany({ where: { id: { in: topClientIds } }, select: { id: true, name: true } })
      : [];
    const topClients = topClientsGroup
      .filter((g) => g.clientId !== null)
      .map((g) => ({
        id: g.clientId as string,
        name: topClientRecords.find((c) => c.id === g.clientId)?.name || '—',
        total: g._sum.totalTTC || 0,
        count: g._count._all,
      }));

    const typeBreakdown: Record<string, number> = {};
    for (const t of ALL_TYPES) {
      typeBreakdown[t] = 0;
    }
    for (const row of typeGroup) {
      typeBreakdown[row.type] = row._count.type;
    }

    const statusBreakdown: Record<string, number> = {};
    for (const row of statusGroup) {
      statusBreakdown[row.status] = row._count.status;
    }

    let trialDaysRemaining = TRIAL_DAYS;
    if (user?.subscriptionStatus === 'TRIAL') {
      if (user.trialStartAt) {
        const trialEnd = new Date(user.trialStartAt);
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
        trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
    } else {
      trialDaysRemaining = 0;
    }

    return NextResponse.json({
      user: {
        name: user?.name || session.name,
        mode: user?.mode || session.mode,
        phone: user?.phone || null,
        companyInfo: user?.companyInfo || null,
      },
      stats: {
        totalDocs,
        monthDocs,
        totalTTC,
        totalClients,
        trialDaysRemaining,
        typeBreakdown,
        statusBreakdown,
        draftCount,
        unpaidTotal: unpaidAgg._sum.totalTTC || 0,
        unpaidCount: unpaidAgg._count._all,
        monthlyRevenue,
        topClients,
        recentDraft: recentDraft
          ? { id: recentDraft.id, number: recentDraft.number, type: recentDraft.type, clientName: recentDraft.client?.name || '', updatedAt: recentDraft.updatedAt }
          : null,
      },
    });
  } catch (error) {
    logger.error('GET /api/dashboard error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
