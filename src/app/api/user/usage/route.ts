import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getPlanByStatus } from '@/lib/pricing';

export const GET = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        subscriptionStatus: true,
        docCountThisMonth: true,
        lastDocResetAt: true,
        storageUsedBytes: true,
        _count: { select: { clients: true, documents: true, teamMembers: true } },
      },
    });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    const plan = getPlanByStatus(user.subscriptionStatus);

    return NextResponse.json({
      documents: {
        current: user.docCountThisMonth,
        limit: plan.limits.docsPerMonth,
        total: user._count.documents,
        lastReset: user.lastDocResetAt,
      },
      clients: {
        total: user._count.clients,
      },
      team: {
        current: user._count.teamMembers,
        limit: plan.limits.teamMembers,
      },
      storage: {
        usedBytes: Number(user.storageUsedBytes),
        limitMB: plan.limits.storageMB,
      },
      plan: {
        id: plan.id,
        name: plan.name,
      },
    });
  } catch (error) {
    logger.error('GET /api/user/usage', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
