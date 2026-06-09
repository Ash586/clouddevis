import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { suspended: true, suspendedAt: true },
    });
    if (user?.suspended) {
      return NextResponse.json({
        error: 'Compte suspendu', suspended: true, suspendedAt: user.suspendedAt,
      }, { status: 403 });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    logger.error('GET /api/auth/me', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
