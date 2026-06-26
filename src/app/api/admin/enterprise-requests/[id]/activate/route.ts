import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(withAdminAuth(async (req, session, ctx) => {
  try {
    const { id } = await ctx.params;
    const er = await prisma.enterpriseRequest.findUnique({ where: { id } });
    if (!er) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    await prisma.user.update({
      where: { id: er.userId },
      data: { subscriptionStatus: 'ENTERPRISE', subscriptionEndAt: null, maxTeamMembers: 999 },
    });

    await prisma.enterpriseRequest.update({
      where: { id },
      data: { status: 'APPROVED', handledById: session.adminId, handledAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        action: 'UPDATE',
        entity: 'SUBSCRIPTION',
        entityId: er.userId,
        details: { enterpriseActivated: true, requestId: id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Activate enterprise', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
