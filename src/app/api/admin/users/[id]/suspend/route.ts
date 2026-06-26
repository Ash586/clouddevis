import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(withAdminAuth(async (_req: Request, session, ctx: { params: Promise<{ id: string }> }) => {
  try {
    if (session.role !== 'ADMIN' && session.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.suspended) {
      return NextResponse.json({ error: 'User is already suspended' }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { suspended: true, suspendedAt: new Date() },
      select: { id: true, name: true, email: true, suspended: true, suspendedAt: true },
    });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        userId: id,
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        details: { action: 'suspend', suspendedAt: new Date().toISOString() },
      },
    });

    logger.info('User suspended', { userId: id, adminId: session.adminId });
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    logger.error('Admin suspend error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
