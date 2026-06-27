import { NextRequest } from 'next/server';

const CSRF_EXEMPT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://clouddevis.vercel.app',
  ].filter(Boolean) as string[],
);

export function requireCsrf(request: NextRequest | Request): void {
  if (CSRF_EXEMPT_METHODS.has(request.method)) return;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const candidate = origin ?? (referer ? new URL(referer).origin : null);

  if (!candidate) {
    throw new Error('CSRF validation failed: missing origin');
  }

  if (!ALLOWED_ORIGINS.has(candidate)) {
    throw new Error(`CSRF validation failed: origin "${candidate}" not in allowed list`);
  }
}
