import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const PATCH = withApiErrorHandling(withAuth(async (_req, session, ctx) => {
  try {
    const { id } = await ctx!.params as { id: string };

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (notification.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ notification: { ...updated, createdAt: updated.createdAt.toISOString() } });
  } catch (error) {
    logger.error('Notification PATCH error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const DELETE = withApiErrorHandling(withAuth(async (_req, session, ctx) => {
  try {
    const { id } = await ctx!.params as { id: string };

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (notification.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Notification DELETE error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
