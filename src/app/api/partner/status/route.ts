import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = withApiErrorHandling(getHandler, { component: 'api', severity: 'medium', userImpact: 'degraded' });
async function getHandler() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ partner: null });

    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      select: { id: true, code: true, tier: true, status: true },
    });

    return NextResponse.json({ partner });
  } catch {
    return NextResponse.json({ partner: null });
  }
}
