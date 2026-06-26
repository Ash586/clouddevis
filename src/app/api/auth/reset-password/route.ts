import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { revokeAllSessions } from '@/lib/auth';
import { requireCsrf } from '@/lib/csrf';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { t } from '@/lib/api-i18n';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    requireCsrf(req);
    const ip = getClientIP(req);
    const rateCheck = await checkRateLimit(`reset:${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: t(req, 'rateLimit') }, { status: 429 });
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: t(req, 'tokenPasswordRequired') }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json({ error: t(req, 'passwordTooShort') }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken) {
      return NextResponse.json({ error: t(req, 'tokenInvalid') }, { status: 400 });
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ error: t(req, 'tokenUsed') }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: t(req, 'tokenExpired') }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Revoke all active sessions — forces re-login on all devices
    await revokeAllSessions(resetToken.userId);

    return NextResponse.json({ success: true, message: t(req, 'passwordResetSuccess') });
  } catch (error) {
    logger.error('Reset password error', { error: String(error) });
    throw error;
  }
}
