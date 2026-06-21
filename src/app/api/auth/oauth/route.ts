import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';

export const GET = withApiErrorHandling(getHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function getHandler() {
  const providers = [
    { id: 'google', label: 'Google', configured: !!process.env.GOOGLE_CLIENT_ID },
    { id: 'github', label: 'GitHub', configured: !!process.env.GITHUB_CLIENT_ID },
  ];
  return NextResponse.json({ providers });
}
