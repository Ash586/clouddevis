import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import type { SessionUser } from '@/lib/auth';
import type { NextRequest } from 'next/server';

// DELETE /api/user/delete — permanently delete the authenticated user's account.
// Cascades: documents, clients, company info are deleted via Prisma schema cascade.
export const DELETE = withApiErrorHandling(withAuth(async (_req: NextRequest, session: SessionUser) => {
  await prisma.user.delete({ where: { id: session.userId } });
  const response = NextResponse.json({ ok: true });
  // Clear session cookie
  response.cookies.set('rakmana-session', '', { maxAge: 0, path: '/' });
  return response;
}));
