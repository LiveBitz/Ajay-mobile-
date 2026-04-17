/**
 * In-memory rate limiter with automatic TTL cleanup.
 *
 * Limitation: state is per-process. On multi-replica deployments (e.g. Vercel
 * with multiple serverless instances) each replica has its own counter, so the
 * effective limit is maxRequests × number-of-replicas.
 *
 * To upgrade to a distributed limiter: replace the Map-based store below with
 * an Upstash Redis client (@upstash/ratelimit) — the public API stays the same.
 */

interface RateLimitConfig {
  interval: number;   // window size in ms
  maxRequests: number;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const stores = new Map<string, RateLimitStore>();

// Purge expired entries every 5 minutes to prevent unbounded memory growth.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, store] of stores.entries()) {
      if (now > store.resetTime) stores.delete(key);
    }
  }, CLEANUP_INTERVAL_MS).unref?.(); // .unref() so the timer doesn't keep the process alive
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const store = stores.get(identifier);

  if (!store || now > store.resetTime) {
    stores.set(identifier, { count: 1, resetTime: now + config.interval });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.interval };
  }

  if (store.count < config.maxRequests) {
    store.count++;
    return { allowed: true, remaining: config.maxRequests - store.count, resetIn: store.resetTime - now };
  }

  return { allowed: false, remaining: 0, resetIn: store.resetTime - now };
}

/**
 * Extract the real client IP, preferring the left-most address in
 * X-Forwarded-For (set by Vercel / load balancers).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";
}

export const RATE_LIMITS = {
  SEARCH:           { interval: 60_000, maxRequests: 30  },
  ORDER:            { interval: 60_000, maxRequests: 10  },
  WISHLIST:         { interval: 60_000, maxRequests: 100 },
  PRODUCT_MUTATION: { interval: 60_000, maxRequests: 50  },
  API_DEFAULT:      { interval: 60_000, maxRequests: 100 },
  ADMIN_LOGIN:      { interval: 15 * 60_000, maxRequests: 5 }, // 5 per 15 min
};
