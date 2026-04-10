/**
 * Inventory Format Validator
 * 
 * Product inventory can be in two formats:
 * 1. Legacy: {M: 10, L: 15, XL: 20} - direct size quantities
 * 2. Modern: ProductSize[] array with {size, quantity} structure
 * 
 * This utility provides consistent interface for both formats
 */

export interface ProductSize {
  size: string;
  quantity: number;
}

export interface InventoryBySize {
  [size: string]: number;
}

export type InventoryFormat = InventoryBySize | ProductSize[];

/**
 * Detect which format the inventory is in
 */
export function detectInventoryFormat(inventory: unknown): "legacy" | "modern" | "invalid" {
  if (!inventory) return "invalid";

  // Check if it's an array (modern format)
  if (Array.isArray(inventory)) {
    if (inventory.length === 0) return "modern";
    const first = inventory[0];
    if (typeof first === "object" && "size" in first && "quantity" in first) {
      return "modern";
    }
    return "invalid";
  }

  // Check if it's an object (legacy format)
  if (typeof inventory === "object" && inventory !== null) {
    const keys = Object.keys(inventory);
    if (keys.length === 0) return "legacy";
    // Simple heuristic: if all values are numbers, likely legacy format
    if (keys.every((key) => typeof (inventory as Record<string, unknown>)[key] === "number")) {
      return "legacy";
    }
    return "invalid";
  }

  return "invalid";
}

/**
 * Convert legacy format to modern format
 */
export function legacyToModern(legacy: InventoryBySize): ProductSize[] {
  return Object.entries(legacy).map(([size, quantity]) => ({
    size,
    quantity: typeof quantity === "number" ? quantity : 0,
  }));
}

/**
 * Convert modern format to legacy format
 */
export function modernToLegacy(modern: ProductSize[]): InventoryBySize {
  const result: InventoryBySize = {};
  for (const item of modern) {
    result[item.size] = item.quantity;
  }
  return result;
}

/**
 * Normalize inventory to modern format (always returns array)
 */
export function normalizeToModern(inventory: InventoryFormat): ProductSize[] {
  const format = detectInventoryFormat(inventory);

  if (format === "modern") {
    return inventory as ProductSize[];
  }

  if (format === "legacy") {
    return legacyToModern(inventory as InventoryBySize);
  }

  return [];
}

/**
 * Normalize inventory to legacy format (always returns object)
 */
export function normalizeToLegacy(inventory: InventoryFormat): InventoryBySize {
  const format = detectInventoryFormat(inventory);

  if (format === "legacy") {
    return inventory as InventoryBySize;
  }

  if (format === "modern") {
    return modernToLegacy(inventory as ProductSize[]);
  }

  return {};
}

/**
 * Get total quantity across all sizes
 */
export function getTotalQuantity(inventory: InventoryFormat): number {
  const modern = normalizeToModern(inventory);
  return modern.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if size has stock
 */
export function hasSizeStock(inventory: InventoryFormat, size: string): boolean {
  const modern = normalizeToModern(inventory);
  const item = modern.find((i) => i.size.toUpperCase() === size.toUpperCase());
  return item ? item.quantity > 0 : false;
}

/**
 * Get quantity for specific size
 */
export function getSizeQuantity(inventory: InventoryFormat, size: string): number {
  const modern = normalizeToModern(inventory);
  const item = modern.find((i) => i.size.toUpperCase() === size.toUpperCase());
  return item?.quantity ?? 0;
}

/**
 * Deduct quantity from size (returns updated inventory)
 */
export function deductFromSize(inventory: InventoryFormat, size: string, quantity: number): ProductSize[] {
  const modern = normalizeToModern(inventory);
  const updated = modern.map((item) => ({
    ...item,
    quantity:
      item.size.toUpperCase() === size.toUpperCase() ? Math.max(0, item.quantity - quantity) : item.quantity,
  }));
  return updated;
}

/**
 * Add quantity to size (returns updated inventory)
 */
export function addToSize(inventory: InventoryFormat, size: string, quantity: number): ProductSize[] {
  const modern = normalizeToModern(inventory);
  const existing = modern.find((i) => i.size.toUpperCase() === size.toUpperCase());

  if (existing) {
    return modern.map((item) => ({
      ...item,
      quantity: item.size.toUpperCase() === size.toUpperCase() ? item.quantity + quantity : item.quantity,
    }));
  }

  return [...modern, { size, quantity }];
}
