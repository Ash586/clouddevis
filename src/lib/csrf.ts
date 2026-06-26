import { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
]);

const CSRF_EXEMPT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/**
 * Validate Origin header on state-changing requests.
 * Cross-origin requests cannot set the session cookie (SameSite=Lax),
 * but this adds defense-in-depth against subdomain attacks and
 * misconfigured CORS.
 *
 * Call this at the top of any POST/PUT/PATCH/DELETE route handler.
 * Throws with a 403 Response if the origin is invalid.
 */
export function requireCsrf(request: NextRequest | Request): void {
  if (CSRF_EXEMPT_METHODS.has(request.method)) return;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Extract origin from Referer when Origin header is absent (e.g. some same-site navigations)
  const candidate = origin ?? (referer ? new URL(referer).origin : null);

  if (!candidate) {
    throw new Error('CSRF validation failed: missing origin');
  }

  if (candidate !== ORIGIN && candidate !== 'http://localhost:3000') {
    throw new Error('CSRF validation failed: invalid origin');
  }
}
