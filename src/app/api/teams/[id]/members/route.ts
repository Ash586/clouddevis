import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    logger.error('Team members GET error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
