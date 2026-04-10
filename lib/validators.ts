/**
 * Input Validation Schemas
 * Type-safe validation for API endpoints
 */

// ============================================
// Product Validation
// ============================================

export function validateProduct(data: any) {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Product name is required and must be a non-empty string');
  }

  if (data.name && data.name.length > 200) {
    errors.push('Product name must be less than 200 characters');
  }

  if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
    errors.push('Price must be a positive number');
  }

  if (data.price > 9999999) {
    errors.push('Price exceeds maximum allowed value');
  }

  if (!data.categoryId || typeof data.categoryId !== 'string') {
    errors.push('Category ID is required');
  }

  if (data.description && data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  if (data.stock !== undefined) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      errors.push('Stock must be a non-negative integer');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// Order Validation
// ============================================

export function validateOrder(data: any) {
  const errors: string[] = [];

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (data.items && Array.isArray(data.items)) {
    data.items.forEach((item: any, index: number) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
      }
      if (item.quantity > 1000) {
        errors.push(`Item ${index + 1}: Quantity exceeds maximum allowed`);
      }
    });
  }

  if (data.shippingAddress) {
    const addressErrors = validateAddress(data.shippingAddress);
    if (!addressErrors.valid) {
      errors.push(`Shipping Address: ${addressErrors.errors.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// Address Validation
// ============================================

export function validateAddress(data: any) {
  const errors: string[] = [];

  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone number is required');
  }

  if (data.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }

  if (!data.street || typeof data.street !== 'string' || data.street.trim().length === 0) {
    errors.push('Street address is required');
  }

  if (!data.city || typeof data.city !== 'string' || data.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!data.state || typeof data.state !== 'string' || data.state.trim().length === 0) {
    errors.push('State is required');
  }

  if (!data.postalCode || typeof data.postalCode !== 'string') {
    errors.push('Postal code is required');
  }

  if (data.postalCode && !/^\d{5,6}$/.test(data.postalCode.replace(/\s/g, ''))) {
    errors.push('Invalid postal code format');
  }

  if (!data.country || typeof data.country !== 'string') {
    errors.push('Country is required');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// User/Auth Validation
// ============================================

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSignup(data: any) {
  const errors: string[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Full name is required');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// Banner Validation
// ============================================

export function validateBanner(data: any) {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Banner title is required');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Banner title must be less than 100 characters');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Banner description must be less than 500 characters');
  }

  if (!data.imageUrl || typeof data.imageUrl !== 'string') {
    errors.push('Banner image URL is required');
  }

  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    errors.push('Invalid image URL format');
  }

  if (data.ctaLink && !isValidUrl(data.ctaLink)) {
    errors.push('Invalid CTA link format');
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// Category Validation
// ============================================

export function validateCategory(data: any) {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Category name is required');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Category name must be less than 100 characters');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Category description must be less than 500 characters');
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// Utility Functions
// ============================================

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .slice(0, 1000); // Limit length
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page?: any, limit?: any) {
  const errors: string[] = [];

  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('Page must be a positive integer');
  }

  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    errors.push('Limit must be between 1 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
    pageNum: pageNum || 1,
    limitNum: Math.min(limitNum || 20, 100),
  };
}
