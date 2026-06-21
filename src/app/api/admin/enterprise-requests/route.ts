import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const requests = await prisma.enterpriseRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json(requests);
  } catch (error) {
    logger.error('Fetch enterprise requests', { error: String(error) });
    throw error;
  }
}
