import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getPlanByStatus, PLANS, PLAN_ORDER } from '@/lib/pricing';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionStatus: true, subscriptionEndAt: true, trialStartAt: true, docCountThisMonth: true, lastDocResetAt: true, storageUsedBytes: true },
    });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    // Reset doc count if new month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (!user.lastDocResetAt || user.lastDocResetAt < startOfMonth) {
      await prisma.user.update({ where: { id: session.userId }, data: { docCountThisMonth: 0, lastDocResetAt: now } });
      user.docCountThisMonth = 0;
    }

    const plan = getPlanByStatus(user.subscriptionStatus);
    const trialDaysRemaining = user.trialStartAt
      ? Math.max(0, 7 - Math.floor((now.getTime() - user.trialStartAt.getTime()) / 86400000))
      : 0;

    return NextResponse.json({
      status: user.subscriptionStatus,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        priceYearly: plan.priceYearly,
        limits: plan.limits,
      },
      usage: {
        docsThisMonth: user.docCountThisMonth,
        docsLimit: plan.limits.docsPerMonth,
        storageBytes: Number(user.storageUsedBytes),
        storageLimitMB: plan.limits.storageMB,
      },
      trialDaysRemaining,
      subscriptionEndAt: user.subscriptionEndAt,
      plans: PLAN_ORDER.map(pid => (PLANS[pid] ? { ...PLANS[pid] } : null)).filter(Boolean),
    });
  } catch (error) {
    logger.error('GET /api/subscription', { error: String(error) });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
