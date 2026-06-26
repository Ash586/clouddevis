import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const POST = withApiErrorHandling(postHandler, { component: 'api', severity: 'medium', userImpact: 'degraded' });
async function postHandler(req: Request) {
  try {
    const body = await req.json();
    const { path, referrer, userAgent, locale, sessionId, userId } = body;

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Infer country from accept-language or default
    const country = req.headers.get('x-vercel-ip-country') || 'unknown';

    // Store page view (fire-and-forget, don't block)
    const pageView = await prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        userAgent: userAgent || null,
        country,
        locale: locale || 'fr',
        sessionId: sessionId || null,
        userId: userId || null,
      },
    });

    // Update system metrics periodically (every 100 views aggregate)
    const count = await prisma.pageView.count();
    if (count % 100 === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await prisma.systemMetric.findFirst({
        where: { timestamp: { gte: today } },
        orderBy: { timestamp: 'desc' },
      });

      const [totalUsers, totalDocuments] = await Promise.all([
        prisma.user.count(),
        prisma.document.count(),
      ]);

      if (existing) {
        await prisma.systemMetric.update({
          where: { id: existing.id },
          data: { totalUsers, totalDocuments },
        });
      } else {
        await prisma.systemMetric.create({
          data: { totalUsers, totalDocuments, uptime: Math.floor(process.uptime()) },
        });
      }
    }

    return NextResponse.json({ success: true, id: pageView.id }, { status: 201 });
  } catch (error) {
    // Don't log tracking errors verbosely — they're non-critical
    logger.error('Page view track error:', { error: String(error) });
    throw error;
  }
}
