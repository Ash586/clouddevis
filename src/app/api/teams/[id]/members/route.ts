import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (_req, session, ctx) => {
  try {
    const { id } = await ctx.params;
    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: session.userId } },
    });
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    logger.error('Team members GET error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
