import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { clearAdminSession } from '@/lib/adminAuth';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
