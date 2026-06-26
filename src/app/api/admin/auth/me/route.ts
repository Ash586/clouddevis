import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';

export const GET = withApiErrorHandling(withAdminAuth(async (req, session) => {
  return NextResponse.json({ admin: session });
}), { component: 'auth', severity: 'high', userImpact: 'blocking' });
