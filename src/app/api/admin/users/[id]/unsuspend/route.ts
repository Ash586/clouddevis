import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role !== 'ADMIN' && session.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
