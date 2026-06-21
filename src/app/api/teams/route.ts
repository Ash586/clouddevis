import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const teams = await prisma.team.findMany({
      where: { members: { some: { userId: session.userId } } },
      include: {
        _count: { select: { members: true, documents: true } },
        owner: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    logger.error('Teams GET error', { error: String(error) });
    throw error;
  }
}

export const POST = withApiErrorHandling(postHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { name } = await req.json();
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Team name must be at least 2 characters' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        slug,
        ownerId: session.userId,
        members: {
          create: { userId: session.userId, role: 'OWNER' },
        },
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    logger.error('Teams POST error', { error: String(error) });
    throw error;
  }
}
