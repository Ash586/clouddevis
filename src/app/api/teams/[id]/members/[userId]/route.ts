import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id, userId } = await params;
    const { role } = await req.json();

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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
