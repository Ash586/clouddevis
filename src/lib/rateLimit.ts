/**
 * Rate limiter backed by Upstash Redis.
 *
 * Falls back to in-memory Map when UPSTASH_REDIS_REST_URL is not configured.
 * The in-memory fallback is local to each Node.js instance (not shared across
 * Vercel workers). For production with multiple instances, set:
 *   UPSTASH_REDIS_REST_URL  — e.g. https://your-endpoint.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN — your Upstash REST API token
 */

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]{2,39}$/;

function isValidIP(ip: string): boolean {
  return IPV4_RE.test(ip) || IPV6_RE.test(ip);
}

/**
 * Extract the real client IP from request headers.
 *
 * Takes only the LAST entry in X-Forwarded-For — the one appended by the
 * outermost trusted proxy (Vercel/Cloudflare). Earlier entries can be
 * forged by the client. Falls back to X-Real-IP, then '127.0.0.1'.
 */
export function getClientIP(req: Request | { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the last non-empty segment — outermost proxy is authoritative
    const parts = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && isValidIP(last)) return last;
  }

  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp && isValidIP(realIp)) return realIp;

  return '127.0.0.1';
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const MAX_MEMORY_ENTRIES = 10_000;

async function upstashIncr(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;

  const res = await fetch(`${upstashUrl}/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${upstashToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', windowKey],
      ['PEXPIRE', windowKey, windowMs],
    ]),
  });

  const results = await res.json();
  const count = results[0]?.result ?? 1;
  const resetAt = Math.floor(now / windowMs) * windowMs + windowMs;
  return { count, resetAt };
}

// In-memory fallback for development / single-instance deployments
const rateMap = new Map<string, { count: number; resetAt: number }>();

try {
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateMap) {
        if (now > entry.resetAt) rateMap.delete(key);
      }
    }, 60_000);
  }
} catch {
  // Edge runtime may not support setInterval
}

function memoryCheck(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    // Evict stale entry before adding a new one if at capacity
    if (rateMap.size >= MAX_MEMORY_ENTRIES) {
      const oldest = rateMap.keys().next().value;
      if (oldest) rateMap.delete(oldest);
    }
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

export async function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): Promise<{ allowed: boolean; remaining: number }> {
  if (upstashUrl && upstashToken) {
    try {
      const { count } = await upstashIncr(key, windowMs);
      return {
        allowed: count <= maxAttempts,
        remaining: Math.max(0, maxAttempts - count),
      };
    } catch {
      // Fall back to memory if Upstash fails
    }
  }
  return memoryCheck(key, maxAttempts, windowMs);
}
