// ============================================================
// Rakmana — Service Worker v3
// Three-tier caching strategy:
//   1. /_next/static/ → cache-first (content-hashed, immutable)
//   2. /api/          → network-first (5s timeout) + cache fallback
//   3. everything else → stale-while-revalidate
// ============================================================

const CACHE_VERSION = 'v3';
const SHELL_CACHE   = `rakmana-shell-${CACHE_VERSION}`;
const STATIC_CACHE  = `rakmana-static-${CACHE_VERSION}`;
const API_CACHE     = `rakmana-api-${CACHE_VERSION}`;

const ALL_CACHES = [SHELL_CACHE, STATIC_CACHE, API_CACHE];

// Pages to pre-load at install time (app shell).
// /app is the Capacitor entry point; / is the web landing page.
const PRECACHE_URLS = ['/app', '/', '/manifest.json'];

// ── Install ───────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      // Best-effort: /app may 404 in staging — don't block install
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { credentials: 'same-origin' }).then((res) => {
            if (res.ok) return cache.put(url, res);
          })
        )
      );
    })
  );
  // Activate immediately (don't wait for old clients to close)
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('rakmana-') && !ALL_CACHES.includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // Only intercept same-origin requests
  let url;
  try { url = new URL(request.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // 1. Next.js immutable static chunks — cache-first
  if (path.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. API routes — network-first with 5s timeout + cache fallback
  if (path.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // 3. App shell + pages — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

// ── Strategies ────────────────────────────────────────────────

/** Serve from cache; populate cache on miss. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Try network first (with timeout).
 * On timeout/failure, fall back to cache.
 * For navigation failures, return the cached /app shell.
 */
async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Offline JSON fallback for API routes
    return new Response(JSON.stringify({ error: 'offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Serve stale cache immediately; refresh in background.
 * Falls back to network on first visit (nothing cached yet).
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Always kick off a background revalidation
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available; otherwise await network
  return cached ?? (await networkFetch) ?? new Response('Offline', { status: 503 });
}
