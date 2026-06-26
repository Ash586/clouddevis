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

    if (!user.suspended) {
      return NextResponse.json({ error: 'User is not suspended' }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { suspended: false, suspendedAt: null },
      select: { id: true, name: true, email: true, suspended: true, suspendedAt: true },
    });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        userId: id,
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        details: { action: 'unsuspend' },
      },
    });

    logger.info('User unsuspended', { userId: id, adminId: session.adminId });
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    logger.error('Admin unsuspend error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
