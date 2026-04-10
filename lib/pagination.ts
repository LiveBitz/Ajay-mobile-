/**
 * Smart pagination utility
 * PHASE 2: Replaces hard-coded .take(10000) limits with proper offset-based pagination
 */

export interface PaginationParams {
  page?: string | number;
  limit?: string | number;
  skip?: string | number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 1000; // Maximum items per request
const MIN_LIMIT = 1;

/**
 * Parse pagination parameters from request
 */
export function getPaginationParams(params: PaginationParams): {
  take: number;
  skip: number;
  page: number;
} {
  // If skip is provided, use cursor-based pagination
  if (params.skip !== undefined) {
    const skip = Math.max(0, parseInt(String(params.skip), 10) || 0);
    const take = Math.min(
      Math.max(MIN_LIMIT, parseInt(String(params.limit), 10) || DEFAULT_LIMIT),
      MAX_LIMIT
    );
    return { take, skip, page: Math.floor(skip / take) + 1 };
  }

  // Otherwise use offset-based pagination
  const page = Math.max(1, parseInt(String(params.page), 10) || 1);
  const limit = Math.min(
    Math.max(MIN_LIMIT, parseInt(String(params.limit), 10) || DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { take: limit, skip, page };
}

/**
 * Format paginated response
 */
export function formatPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Validation for pagination parameters
 */
export function validatePaginationParams(limit?: number, page?: number): string | null {
  if (limit !== undefined && (limit < 1 || limit > MAX_LIMIT)) {
    return `Limit must be between 1 and ${MAX_LIMIT}`;
  }

  if (page !== undefined && page < 1) {
    return "Page must be >= 1";
  }

  return null;
}
