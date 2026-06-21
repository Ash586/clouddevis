import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(postHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function postHandler(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { token } = await params;

    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { team: true },
    });

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    if (invite.status !== 'PENDING') return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    if (invite.expiresAt < new Date()) {
      await prisma.teamInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } });
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
    }
    if (invite.email !== session.email) return NextResponse.json({ error: 'This invite was sent to a different email' }, { status: 403 });

    // Add as member
    await prisma.teamMember.create({
      data: { teamId: invite.teamId, userId: session.userId, role: invite.role },
    });

    // Mark invite as accepted
    await prisma.teamInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    });

    return NextResponse.json({ success: true, team: { id: invite.teamId, name: invite.team.name } });
  } catch (error) {
    logger.error('Invite accept error', { error: String(error) });
    throw error;
  }
}

export const DELETE = withApiErrorHandling(deleteHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function deleteHandler(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { token } = await params;
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { team: true },
    });
    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: invite.teamId, userId: session.userId } },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.teamInvite.delete({ where: { token } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Invite DELETE error', { error: String(error) });
    throw error;
  }
}
