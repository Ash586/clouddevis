import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { requireCsrf } from '@/lib/csrf';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { t } from '@/lib/api-i18n';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    requireCsrf(req);
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: t(req, 'emailRequired') }, { status: 400 });
    }

    const ip = getClientIP(req);
    const rateCheck = await checkRateLimit(`forgot:${email}:${ip}`, 3, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: t(req, 'rateLimit') }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const escHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeName = escHtml(user.name || '');

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app'}/auth/reset-password#token=${token}`;

    // Send reset email
    const appName = 'Rakmana';
    await sendEmail({
      to: user.email,
      subject: `Réinitialisation de votre mot de passe ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0B0F1A;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${safeName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe sur ${appName}.</p>
          <p>Ce lien expirera dans <strong>1 heure</strong>.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #666; font-size: 13px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) {
    logger.error('Forgot password error', { error: String(error) });
    throw error;
  }
}
