import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { clearSession, SESSION_COOKIE } from '@/lib/auth';
import { requireCsrf } from '@/lib/csrf';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  requireCsrf(req);
  await clearSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
