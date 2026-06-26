import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where = { userId: session.userId };
    if (unreadOnly) Object.assign(where, { read: false });

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: session.userId, read: false } }),
    ]);

    return NextResponse.json({
      notifications: notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Notifications GET error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const { type, title, message, link } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: session.userId,
        type: type || 'INFO',
        title,
        message,
        link,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    logger.error('Notifications POST error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
