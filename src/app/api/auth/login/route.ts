import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession, applySessionCookie } from '@/lib/auth';
import { requireCsrf } from '@/lib/csrf';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateAuthInput } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { t, getLang } from '@/lib/api-i18n';

export const runtime = 'nodejs';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  requireCsrf(req);

  const body = await req.json();
  const validation = validateAuthInput(body, 'login', getLang(req));
  if (!validation.valid) {
    return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
  }

  const { email, password, rememberMe } = body;

  const ip = getClientIP(req);
  const rateCheck = await checkRateLimit(`login:${ip}`, 5, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: t(req, 'rateLimit') }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: t(req, 'invalidCredentials') }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: t(req, 'invalidCredentials') }, { status: 401 });
  }

  if (user.suspended) {
    return NextResponse.json({ error: t(req, 'userSuspended') }, { status: 403 });
  }

  const { token, maxAge } = await createSession(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode?.toLowerCase() || 'artisan',
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    },
    rememberMe === true,
  );

  const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  applySessionCookie(response, token, maxAge);
  return response;
}
