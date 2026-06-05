import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(`forgot:${email}:${ip}`, 3, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
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

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // TODO: Send reset email via Resend/Nodemailer in production
    // For now, return success silently (no console.log of reset URL in production)

    return NextResponse.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
