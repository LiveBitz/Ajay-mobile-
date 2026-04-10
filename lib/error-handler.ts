/**
 * Centralized Error Handling & Logging
 * Production-grade error management without external dependencies
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
  timestamp: string;
}

/**
 * Error log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Centralized logger
 */
export class Logger {
  static log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In production, you can integrate with services like:
    // - CloudWatch, Datadog, NewRelic, LogRocket, Sentry
    // For now, output to console (Vercel captures this)
    console[level === LogLevel.CRITICAL ? 'error' : 'log'](
      JSON.stringify(logEntry)
    );

    // Optional: Store critical errors in database for analytics
    if (level === LogLevel.CRITICAL || level === LogLevel.ERROR) {
      // captureErrorToDatabase(logEntry); // TODO: implement if needed
    }
  }

  static debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  static info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  static warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  static error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }

  static critical(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.CRITICAL, message, context);
  }
}

/**
 * Common error types
 */
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: { code: 'UNAUTHORIZED', statusCode: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', statusCode: 403 },

  // Validation
  INVALID_INPUT: { code: 'INVALID_INPUT', statusCode: 400 },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', statusCode: 422 },
  MISSING_REQUIRED_FIELD: { code: 'MISSING_REQUIRED_FIELD', statusCode: 400 },

  // Resource
  NOT_FOUND: { code: 'NOT_FOUND', statusCode: 404 },
  CONFLICT: { code: 'CONFLICT', statusCode: 409 },

  // Rate limiting
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },

  // Server errors
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', statusCode: 500 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', statusCode: 500 },
  EXTERNAL_SERVICE_ERROR: { code: 'EXTERNAL_SERVICE_ERROR', statusCode: 503 },
};

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown
): ApiError {
  return {
    code,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle API errors with proper logging and response
 */
export function handleApiError(
  error: unknown,
  defaultStatusCode: number = 500
) {
  const timestamp = new Date().toISOString();

  let statusCode = defaultStatusCode;
  let message = 'An unexpected error occurred';
  let code = ERROR_CODES.INTERNAL_ERROR.code;

  if (error instanceof Error) {
    message = error.message;

    // Check for specific error types
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      statusCode = 401;
      code = ERROR_CODES.UNAUTHORIZED.code;
    } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
      statusCode = 403;
      code = ERROR_CODES.FORBIDDEN.code;
    } else if (error.message.includes('Not found') || error.message.includes('404')) {
      statusCode = 404;
      code = ERROR_CODES.NOT_FOUND.code;
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      statusCode = 429;
      code = ERROR_CODES.RATE_LIMIT_EXCEEDED.code;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      statusCode = 400;
      code = ERROR_CODES.INVALID_INPUT.code;
    }

    // Log the error
    Logger.error(message, {
      statusCode,
      code,
      timestamp,
      stack: error.stack,
    });
  }

  return NextResponse.json(
    createErrorResponse(code, message, statusCode),
    { status: statusCode }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    Logger.warn('JSON parse failed', { json, error: String(error) });
    return defaultValue;
  }
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (
    req?: Request,
    context?: Record<string, unknown>
  ) => Promise<Response | NextResponse>
) {
  return async (req: Request, context?: Record<string, unknown>) => {
    try {
      return await fn(req, context);
    } catch (error) {
      Logger.critical('Unhandled error in route handler', { 
        error: error instanceof Error ? error.message : String(error),
        path: req.url,
      });
      return handleApiError(error);
    }
  };
}
