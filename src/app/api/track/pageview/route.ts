import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
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
    console.error('Page view track error:', String(error));
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
