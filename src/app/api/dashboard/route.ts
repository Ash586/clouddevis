import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { TRIAL_DAYS } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ALL_TYPES = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE', 'INTERVENTION', 'ATTACHEMENT'] as const;

    const [totalDocs, monthDocs, totalClients, aggregated, typeGroup, statusGroup, draftCount, recentDraft, user] = await Promise.all([
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
    ]);

    const totalTTC = aggregated._sum.totalTTC || 0;

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
        totalTTC: totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalClients,
        trialDaysRemaining,
        typeBreakdown,
        statusBreakdown,
        draftCount,
        recentDraft: recentDraft
          ? { id: recentDraft.id, number: recentDraft.number, type: recentDraft.type, clientName: recentDraft.client?.name || '', updatedAt: recentDraft.updatedAt }
          : null,
      },
    });
  } catch (error) {
    logger.error('GET /api/dashboard error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
