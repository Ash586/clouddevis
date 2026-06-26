import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const VALID_STATUSES = ['ACTIVE', 'SUSPENDED', 'REJECTED'];

export const PATCH = withApiErrorHandling(withAdminAuth(async (req: Request, session, ctx: { params: Promise<{ id: string }> }) => {
  try {
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { id } = await ctx.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    const data: Record<string, unknown> = { status };
    if (status === 'ACTIVE') data.approvedAt = new Date();

    const updated = await prisma.partner.update({ where: { id }, data });

    return NextResponse.json({ success: true, partner: { id: updated.id, status: updated.status } });
  } catch (error) {
    logger.error('Admin update partner status error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
