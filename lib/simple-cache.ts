/**
 * Simple in-memory cache for frequently accessed data
 * PHASE 1: Application-level caching to reduce database queries
 * 
 * Use for: Categories, static product lists, banners
 * TTL: Configurable per cache entry
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Get value from cache, returns null if expired or not found
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL (milliseconds)
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Get or fetch - useful pattern for conditional data fetching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch if not in cache
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const keys = Array.from(this.store.keys()).filter(key => regex.test(key));
    keys.forEach(key => this.store.delete(key));
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

export const cache = new SimpleCache();

/**
 * Predefined cache durations
 */
export const CACHE_DURATIONS = {
  VERY_SHORT: 5 * 60 * 1000,         // 5 minutes - for changing data
  SHORT: 15 * 60 * 1000,              // 15 minutes - for moderately changing data
  MEDIUM: 60 * 60 * 1000,             // 1 hour - for stable data
  LONG: 24 * 60 * 60 * 1000,          // 24 hours - for mostly static data
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 days - for rarely changing data
};

/**
 * Cache key builders for consistency
 */
export const CACHE_KEYS = {
  CATEGORIES: 'categories:all',
  CATEGORY: (slug: string) => `category:${slug}`,
  PRODUCTS_NEW: 'products:new',
  PRODUCTS_BESTSELLER: 'products:bestseller',
  PRODUCT_BY_SLUG: (slug: string) => `product:${slug}`,
  PRODUCT_BY_ID: (id: string) => `product:id:${id}`,
  BANNERS: 'banners:active',
  DASHBOARD_STATS: (range: string) => `dashboard:stats:${range}`,
};
