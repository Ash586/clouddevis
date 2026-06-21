import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateAuthInput } from '@/lib/validation';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    const body = await req.json();
    const validation = validateAuthInput(body, 'login');
    if (!validation.valid) {
      return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
    }

    const { email, password, rememberMe } = body;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = await checkRateLimit(`login:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    if (user.suspended) {
      return NextResponse.json({ error: 'Votre compte a été suspendu. Contactez le support.' }, { status: 403 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode?.toLowerCase() || 'artisan',
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    }, rememberMe === true);

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack?.split('\n').slice(0, 3).join(' ') : '';
    logger.error('Login error', { message: msg, stack });
    throw error;
  }
}
