/**
 * Rate limiter backed by Upstash Redis.
 * 
 * Falls back to in-memory Map when UPSTASH_REDIS_REST_URL is not configured.
 * For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.
 */

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

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

// In-memory fallback for development
const rateMap = new Map<string, { count: number; resetAt: number }>();

try {
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateMap) {
        if (now > entry.resetAt) rateMap.delete(key);
      }
    }, 5 * 60 * 1000);
  }
} catch {
  // Edge runtime may not support setInterval
}

function memoryCheck(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
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
