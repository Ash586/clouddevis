import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAdminAuth(async () => {
  try {
    const requests = await prisma.enterpriseRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json(requests);
  } catch (error) {
    logger.error('Fetch enterprise requests', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
