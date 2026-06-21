import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const MIN_PAYOUT = 2000;

export const POST = withApiErrorHandling(postHandler, { component: 'api', severity: 'medium', userImpact: 'degraded' });
async function postHandler() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      select: { id: true, status: true },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const pendingPayout = await prisma.payout.findFirst({
      where: { partnerId: partner.id, status: 'PENDING' },
    });

    if (pendingPayout) {
      return NextResponse.json({ error: 'Vous avez déjà une demande de paiement en cours' }, { status: 400 });
    }

    const pendingCommissions = await prisma.commission.aggregate({
      where: { partnerId: partner.id, status: 'PENDING' },
      _sum: { amount: true },
    });

    const totalAmount = pendingCommissions._sum.amount || 0;

    if (totalAmount < MIN_PAYOUT) {
      return NextResponse.json({ error: `Le montant minimum de retrait est de ${MIN_PAYOUT} DA` }, { status: 400 });
    }

    const payout = await prisma.payout.create({
      data: {
        partnerId: partner.id,
        totalAmount,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      payout: { id: payout.id, totalAmount, status: payout.status, requestedAt: payout.requestedAt },
    });
  } catch (error) {
    logger.error('Partner payout request error', { error: String(error) });
    throw error;
  }
}
