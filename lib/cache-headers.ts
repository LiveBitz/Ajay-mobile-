/**
 * Cache Headers Utility for API Response Optimization
 * 
 * Reduces bandwidth usage and improves response times
 * by implementing proper browser caching strategies
 */

import { NextResponse, type NextRequest } from "next/server";

export interface CacheConfig {
  maxAge?: number; // seconds for browser cache
  sMaxAge?: number; // seconds for CDN/server cache
  staleWhileRevalidate?: number; // seconds to serve stale while revalidating
  revalidate?: "no-cache" | "no-store";
  immutable?: boolean;
  public?: boolean;
  private?: boolean;
}

/**
 * Generate Cache-Control header value
 */
export function generateCacheControl(config: CacheConfig): string {
  const parts: string[] = [];

  if (config.private) parts.push("private");
  else if (config.public) parts.push("public");

  if (config.immutable) parts.push("immutable");

  if (config.revalidate) {
    parts.push(config.revalidate);
  } else {
    if (config.maxAge) parts.push(`max-age=${config.maxAge}`);
    if (config.sMaxAge) parts.push(`s-maxage=${config.sMaxAge}`);
    if (config.staleWhileRevalidate) parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  return parts.join(", ");
}

/**
 * Add cache headers to API response
 */
export function addCacheHeaders(response: NextResponse, config: CacheConfig): NextResponse {
  response.headers.set("Cache-Control", generateCacheControl(config));
  return response;
}

/**
 * Predefined cache strategies
 */
export const CACHE_STRATEGIES = {
  // Products/Categories - Cache for 24 hours, CDN for 7 days
  PRODUCT_DATA: {
    maxAge: 60 * 60 * 24, // 24 hours browser
    sMaxAge: 60 * 60 * 24 * 7, // 7 days CDN
    staleWhileRevalidate: 60 * 60, // serve stale for 1 hour while revalidating
    public: true,
  },

  // Images - Cache permanently (immutable when using content-hash)
  STATIC_ASSETS: {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sMaxAge: 60 * 60 * 24 * 365,
    immutable: true,
    public: true,
  },

  // Search results - Cache for 1 hour
  SEARCH_RESULTS: {
    maxAge: 60 * 60, // 1 hour
    sMaxAge: 60 * 60 * 24, // 24 hours CDN
    public: true,
  },

  // Personalized data (Orders, Addresses) - No cache, private only
  PERSONAL_DATA: {
    revalidate: "no-cache" as const,
    private: true,
  },

  // Real-time data - No cache
  REALTIME: {
    revalidate: "no-store" as const,
    private: true,
  },
};
