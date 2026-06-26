import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const PATCH = withApiErrorHandling(withAdminAuth(async (req: Request, session, ctx: { params: Promise<{ id: string }> }) => {
  try {
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { id } = await ctx.params;
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
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
