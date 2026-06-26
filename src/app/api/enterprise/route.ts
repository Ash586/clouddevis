import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const { companyName, employees, needs, phone } = body as Record<string, string>;

    if (!companyName || !employees || !needs) {
      return NextResponse.json({ error: 'companyName, employees, et needs sont requis' }, { status: 400 });
    }

    const existing = await prisma.enterpriseRequest.findFirst({
      where: { userId: session.userId, status: { in: ['PENDING', 'CONTACTED'] } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà une demande en cours.' }, { status: 409 });
    }

    const request = await prisma.enterpriseRequest.create({
      data: {
        userId: session.userId,
        companyName,
        employees,
        needs,
        phone: phone || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'SUBSCRIPTION',
        entityId: request.id,
        details: { enterpriseRequest: { companyName, employees, needs, phone } },
      },
    });

    return NextResponse.json({ success: true, message: 'Demande envoyée. Nous vous contacterons sous 48h.' });
  } catch (error) {
    logger.error('Enterprise request error', { error: String(error) });
    throw error;
  }
}), { component: 'api', severity: 'medium', userImpact: 'degraded' });
