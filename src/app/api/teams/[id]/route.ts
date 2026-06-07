import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { role: 'asc' },
        },
        invites: { where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } },
        _count: { select: { documents: true } },
      },
    });

    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const isMember = team.members.some(m => m.userId === session.userId);
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ team });
  } catch (error) {
    logger.error('Team GET error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const { name } = await req.json();

    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: session.userId } },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const team = await prisma.team.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ team });
  } catch (error) {
    logger.error('Team PATCH error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    if (team.ownerId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.team.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Team DELETE error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
