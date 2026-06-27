import { NextResponse } from 'next/server';

// Temporary diagnostic endpoint — DELETE after auth is confirmed working
export async function GET() {
  const r: Record<string, unknown> = {};

  // 1. Env vars
  r.appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '(not set)';
  r.hasJwt = !!process.env.JWT_SECRET;
  r.hasFieldKey = !!process.env.FIELD_ENCRYPTION_KEY;
  r.fieldKeyLen = process.env.FIELD_ENCRYPTION_KEY?.length ?? 0;

  // 2. DB connection
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    r.db = 'ok';

    // 3. Session table has jti?
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Session'
    `;
    r.sessionCols = cols.map((c) => c.column_name);
  } catch (e) {
    r.db = String(e);
  }

  // 4. CSRF allowed origins
  const allowed = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://clouddevis.vercel.app',
  ].filter(Boolean);
  r.csrfAllowed = allowed;

  return NextResponse.json(r);
}
