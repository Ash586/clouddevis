import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';

export const GET = withApiErrorHandling(getHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ admin: session });
}
