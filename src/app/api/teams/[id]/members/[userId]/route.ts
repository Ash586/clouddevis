import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const VALID_ROLES = ['MEMBER', 'ADMIN', 'OWNER'];

export const PATCH = withApiErrorHandling(patchHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function patchHandler(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id, userId } = await params;
    const { role } = await req.json();

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const currentMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: session.userId } },
    });
    if (!currentMember || currentMember.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.teamMember.update({
      where: { teamId_userId: { teamId: id, userId } },
      data: { role },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    logger.error('Team member PATCH error', { error: String(error) });
    throw error;
  }
}

export const DELETE = withApiErrorHandling(deleteHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function deleteHandler(_req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id, userId } = await params;

    const currentMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: session.userId } },
    });
    if (!currentMember || currentMember.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: id, userId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Team member DELETE error', { error: String(error) });
    throw error;
  }
}
