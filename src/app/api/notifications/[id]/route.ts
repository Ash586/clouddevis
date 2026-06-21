import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const PATCH = withApiErrorHandling(patchHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function patchHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;

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
}

export const DELETE = withApiErrorHandling(deleteHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function deleteHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (notification.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Notification DELETE error', { error: String(error) });
    throw error;
  }
}
