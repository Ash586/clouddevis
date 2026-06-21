import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { clearSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('POST /api/auth/logout', { error: String(error) });
    throw error;
  }
}
