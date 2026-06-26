import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { clearSession } from '@/lib/auth';
import { requireCsrf } from '@/lib/csrf';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    requireCsrf(req);
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('POST /api/auth/logout', { error: String(error) });
    throw error;
  }
}
