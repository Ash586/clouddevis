import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(`reset:${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe trop court (min 6 caractères)' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ error: 'Token déjà utilisé' }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expiré' }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    logger.error('Reset password error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
