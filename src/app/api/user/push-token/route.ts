import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** PUT /api/user/push-token — store or clear an FCM device token */
export const PUT = withApiErrorHandling(withAuth(async (req, session) => {
  const body = await req.json() as { token?: string; platform?: string };
  const token = typeof body.token === 'string' ? body.token.trim() : null;

  await prisma.user.update({
    where: { id: session.userId },
    data: { fcmToken: token || null },
  });

  return NextResponse.json({ ok: true });
}), { component: 'api', severity: 'low', userImpact: 'cosmetic' });

/** DELETE /api/user/push-token — remove FCM token on logout */
export const DELETE = withApiErrorHandling(withAuth(async (_req, session) => {
  await prisma.user.update({
    where: { id: session.userId },
    data: { fcmToken: null },
  });
  return NextResponse.json({ ok: true });
}), { component: 'api', severity: 'low', userImpact: 'cosmetic' });
