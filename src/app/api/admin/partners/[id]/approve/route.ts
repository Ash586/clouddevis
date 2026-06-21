import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const PATCH = withApiErrorHandling(patchHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function patchHandler(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { id } = await params;
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    const approved = await prisma.partner.update({
      where: { id },
      data: { status: 'ACTIVE', approvedAt: new Date() },
    });

    return NextResponse.json({ success: true, partner: { id: approved.id, status: approved.status } });
  } catch (error) {
    logger.error('Admin approve partner error', { error: String(error) });
    throw error;
  }
}
