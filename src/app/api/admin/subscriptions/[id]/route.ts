import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const VALID_SUBSCRIPTION_STATUSES = ['TRIAL', 'FREE', 'BASIC', 'STANDARD', 'PRO', 'MAX', 'ENTERPRISE', 'SUSPENDED'];

export const GET = withApiErrorHandling(getHandler, { component: 'billing', severity: 'critical', userImpact: 'blocking' });
async function getHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true,
        subscriptionStatus: true, trialStartAt: true, subscriptionEndAt: true,
        createdAt: true, updatedAt: true,
        _count: { select: { documents: true } },
      },
    });

    if (!user) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

    return NextResponse.json({
      subscription: {
        ...user,
        trialStartAt: user.trialStartAt?.toISOString() ?? null,
        subscriptionEndAt: user.subscriptionEndAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Admin subscription detail error', { error: String(error) });
    throw error;
  }
}

export const PATCH = withApiErrorHandling(patchHandler, { component: 'billing', severity: 'critical', userImpact: 'blocking' });
async function patchHandler(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role !== 'ADMIN' && session.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { subscriptionStatus, subscriptionEndAt, trialStartAt } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (subscriptionStatus) {
      if (!VALID_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)) {
        return NextResponse.json({ error: 'Invalid subscription status' }, { status: 400 });
      }
      updateData.subscriptionStatus = subscriptionStatus;
    }
    if (subscriptionEndAt) updateData.subscriptionEndAt = new Date(subscriptionEndAt);
    if (trialStartAt) updateData.trialStartAt = new Date(trialStartAt);

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, subscriptionStatus: true, subscriptionEndAt: true, trialStartAt: true },
    });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        userId: id,
        action: 'UPDATE',
        entity: 'SUBSCRIPTION',
        entityId: id,
        details: JSON.parse(JSON.stringify({ changes: updateData })),
      },
    });

    logger.info('Subscription updated', { userId: id, adminId: session.adminId });
    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    logger.error('Admin subscription update error', { error: String(error) });
    throw error;
  }
}
