import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const shared = await prisma.documentShare.findMany({
      where: { sharedWithId: session.userId },
      include: {
        document: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      documents: shared.map(s => ({
        id: s.document.id,
        number: s.document.number,
        type: s.document.type,
        status: s.document.status,
        total: s.document.totalTTC,
        client: s.document.client?.name || '—',
        sharedBy: s.document.user.name,
        permission: s.permission,
        date: s.document.date.toISOString().split('T')[0],
        sharedAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('Shared docs GET error', { error: String(error) });
    throw error;
  }
}
