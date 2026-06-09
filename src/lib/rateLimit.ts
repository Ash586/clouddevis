// Serverless-safe rate limiting using in-memory (best-effort).
// For production with many concurrent users, replace with Redis (e.g. @upstash/redis).

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
  // Edge runtime may not support setInterval — ignore
}

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): { allowed: boolean; remaining: number } {
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
