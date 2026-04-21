/**
 * Inventory Utility Functions
 * Handles both old format ("S:10") and new format ("S-Purple:5")
 */

/**
 * Gets total stock from sizes array
 * Supports both formats:
 * - Old: "S:10", "M:15" (size:quantity)
 * - New: "S-Purple:5", "M-Black:8" (size-color:quantity)
 */
export const getTotalStock = (sizes: string[] = []): number => {
  if (!Array.isArray(sizes)) return 0;
  
  return sizes.reduce((total, entry) => {
    if (typeof entry !== 'string' || !entry.includes(":")) return total;
    
    // Extract quantity (always after the last colon)
    const quantity = parseInt(entry.split(":").pop() || "0") || 0;
    return total + (quantity > 0 ? quantity : 0);
  }, 0);
};

/**
 * Checks if product has stock
 */
export const hasStock = (sizes: string[] = []): boolean => {
  return getTotalStock(sizes) > 0;
};

/**
 * Cleans a label by removing internal metadata suffixes like |#| or accidental ID colons.
 * Example: "8GB | 128GB |#| #E392FE:2:1" -> "8GB | 128GB"
 */
export const cleanLabel = (str: string): string => {
  if (!str) return "";
  return str.split("|#|")[0].split(":")[0].trim();
};

/**
 * Extracts base size from inventory entry
 * "S-Purple:5" → "S"
 */
export const extractBaseSize = (entry: string): string => {
  if (!entry.includes(":")) return entry;
  const key = entry.split(":")[0];
  const label = key.includes("-") ? key.split("-")[0] : key;
  return cleanLabel(label);
};

/**
 * Extracts color from inventory entry
 * "S-Purple:5" → "Purple"
 * "S:10" → null (old format)
 */
export const extractColor = (entry: string): string | null => {
  if (!entry.includes(":")) return null;
  const key = entry.split(":")[0];
  if (!key.includes("-")) return null; // Old format
  return key.split("-")[1];
};

/**
 * Gets available colors for a specific size
 * New format only: "S-Purple:5", "S-Black:3" → ["Purple", "Black"]
 */
export const getAvailableColorsForSize = (
  sizes: string[],
  targetSize: string
): string[] => {
  const colors = new Set<string>();
  
  sizes.forEach((entry) => {
    if (!entry.includes(":")) return;
    
    const baseSize = extractBaseSize(entry);
    if (baseSize !== targetSize) return;
    
    const color = extractColor(entry);
    if (color) colors.add(color);
  });
  
  return Array.from(colors);
};

/**
 * Gets all unique base sizes from inventory entries
 * ["S:10", "M:15", "S-Purple:5"] → ["S", "M"]
 */
export const extractBaseSizes = (sizes: string[] = []): string[] => {
  const baseSizes = new Set<string>();
  
  sizes.forEach((entry) => {
    const baseSize = extractBaseSize(entry);
    baseSizes.add(baseSize);
  });
  
  return Array.from(baseSizes);
};

/**
 * Gets all unique colors from inventory entries
 * New format only: ["S-Purple:5", "M-Black:3"] → ["Purple", "Black"]
 */
export const extractColors = (sizes: string[] = []): string[] => {
  const colors = new Set<string>();
  
  sizes.forEach((entry) => {
    const color = extractColor(entry);
    if (color) colors.add(color);
  });
  
  return Array.from(colors);
};

/**
 * Validates inventory entry format
 */
export const isValidInventoryEntry = (entry: string): boolean => {
  if (!entry.includes(":")) return false;
  
  const [key, qtyStr] = entry.split(":");
  if (!key || !qtyStr) return false;
  
  const quantity = parseInt(qtyStr);
  if (isNaN(quantity) || quantity < 0) return false;
  
  return true;
};

/**
 * Validates if all sizes and colors can form a valid inventory matrix
 * Returns { isValid: boolean, errors: string[] }
 */
export const validateInventoryMatrix = (
  sizes: string[],
  colors: string[],
  inventory: Record<string, number>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for negative quantities
  Object.entries(inventory).forEach(([_, qty]) => {
    if (qty < 0) {
      errors.push("Inventory quantities cannot be negative");
    }
  });
  
  // Check if all entries have valid format
  Object.keys(inventory).forEach((key) => {
    const parts = key.split("-");
    if (parts.length !== 2) {
      errors.push(`Invalid inventory key format: ${key}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
/**
 * Parses a color string that may contain internal hex metadata.
 * Format: "Color Name|#|#HexCode"
 * Fallback: If no hex metadata exists, returns the string as both name and hex.
 */
export const parseColor = (colorStr: string): { name: string; hex: string } => {
  if (!colorStr) return { name: "", hex: "#000000" };
  
  if (colorStr.includes("|#|")) {
    const [name, hex] = colorStr.split("|#|");
    return { 
      name: name.trim(), 
      hex: hex.trim() 
    };
  }
  
  // Legacy or standard color name
  return { 
    name: colorStr, 
    hex: colorStr // CSS can handle some names, others will fallback in UI
  };
};

/**
 * Returns the name of the color for display
 */
export const cleanColorName = (colorStr: string): string => {
  return parseColor(colorStr).name;
};
