/**
 * Request/Response Logging Utility
 * Track API performance and debug issues
 */

import { NextRequest } from 'next/server';

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration: number; // milliseconds
  userId?: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}

/**
 * Extract client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Log API request/response
 */
export function logRequest(log: RequestLog) {
  if (process.env.NODE_ENV === 'production') {
    // In production, you can send to external logging service
    // For now, just console log (Vercel captures this)
    console.log(JSON.stringify({
      type: 'API_REQUEST',
      ...log,
    }));
  } else {
    // Development logging
    if (log.error) {
      console.error(`[${log.method}] ${log.path} - ${log.statusCode} - ${log.duration}ms`, log.error);
    } else {
      console.log(`[${log.method}] ${log.path} - ${log.statusCode} - ${log.duration}ms`);
    }
  }
}

/**
 * Wrapper to log all API requests
 */
export function withRequestLogging(
  handler: (
    req: NextRequest,
    context?: unknown
  ) => Promise<Response>
) {
  return async (req: NextRequest, context?: unknown) => {
    const startTime = performance.now();
    const path = new URL(req.url).pathname;
    const method = req.method;
    const ip = getClientIP(req);
    const userAgent = req.headers.get('user-agent');

    try {
      const response = await handler(req, context);
      const duration = Math.round(performance.now() - startTime);

      logRequest({
        timestamp: new Date().toISOString(),
        method,
        path,
        statusCode: response.status,
        duration,
        userAgent: userAgent || undefined,
        ip,
      });

      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      logRequest({
        timestamp: new Date().toISOString(),
        method,
        path,
        statusCode: 500,
        duration,
        userAgent: userAgent || undefined,
        ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static mark(key: string) {
    this.marks.set(key, performance.now());
  }

  static measure(key: string): number {
    const startMark = this.marks.get(key);
    if (!startMark) {
      return 0;
    }
    const duration = performance.now() - startMark;
    this.marks.delete(key);
    return Math.round(duration);
  }

  static logMeasure(key: string, duration: number, threshold: number = 1000) {
    if (duration > threshold) {
      console.warn(`[PERFORMANCE] ${key}: ${duration}ms (exceeded ${threshold}ms)`, {
        timestamp: new Date().toISOString(),
        key,
        duration,
        threshold,
      });
    }
  }
}
