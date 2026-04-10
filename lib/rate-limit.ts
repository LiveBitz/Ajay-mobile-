/**
 * Simple in-memory rate limiter
 * Production: Use Redis for distributed rate limiting
 */

interface RateLimitConfig {
  interval: number; // ms
  maxRequests: number;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const stores = new Map<string, RateLimitStore>();

/**
 * Rate limit by identifier (IP, user ID, etc.)
 */
export function rateLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const store = stores.get(identifier);

  if (!store || now > store.resetTime) {
    // New window
    stores.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
    };
  }

  // Existing window
  if (store.count < config.maxRequests) {
    store.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - store.count,
      resetIn: store.resetTime - now,
    };
  }

  // Limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetIn: store.resetTime - now,
  };
}

/**
 * Get IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Common rate limit configs
 */
export const RATE_LIMITS = {
  // Stricter for mutations
  SEARCH: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  ORDER: {
    interval: 60 * 1000,
    maxRequests: 10, // 10 orders per minute
  },
  WISHLIST: {
    interval: 60 * 1000,
    maxRequests: 100, // 100 wishlist updates per minute
  },
  PRODUCT_MUTATION: {
    interval: 60 * 1000,
    maxRequests: 50, // 50 create/update/delete per minute
  },
  // Looser for reads
  API_DEFAULT: {
    interval: 60 * 1000,
    maxRequests: 100, // 100 requests per minute
  },
};
