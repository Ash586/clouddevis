import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Internal engineering reports (docs/*.html) — admin-only, never public.
// Allow-list by name so the route can never be tricked into reading an
// arbitrary path off the filesystem.
const ALLOWED_DOCS: Record<string, string> = {
  handoff: 'handoff.html',
  'dashboard-architecture-2026': 'dashboard-architecture-2026.html',
};

export const GET = withApiErrorHandling(withAdminAuth(async (_req, _session, ctx) => {
  const { name } = await ctx!.params as { name: string };
  const filename = ALLOWED_DOCS[name];
  if (!filename) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'docs', filename);
    const html = await readFile(filePath, 'utf-8');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    logger.error('GET /api/admin/docs/[name] error', { error: String(error), name });
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
  }
}), { component: 'api', severity: 'low', userImpact: 'cosmetic' });
