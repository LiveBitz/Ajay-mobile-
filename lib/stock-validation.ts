import { cleanColorName } from "./inventory";

interface ProductInventory {
  name: string;
  stock: number;
  sizes: string[];
}

interface CartSelection {
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export function getAvailableQuantity(product: ProductInventory, selection: CartSelection): number {
  if (!selection.size || !Array.isArray(product.sizes) || product.sizes.length === 0) {
    return product.stock || 0;
  }

  for (const entry of product.sizes) {
    if (typeof entry !== "string" || !entry.includes(":")) continue;

    const colonIdx = entry.lastIndexOf(":");
    const key = entry.slice(0, colonIdx);
    const qty = parseInt(entry.slice(colonIdx + 1), 10) || 0;
    const dashIdx = key.indexOf("-");

    if (dashIdx === -1) {
      if (key === selection.size) return qty;
      continue;
    }

    const size = key.slice(0, dashIdx);
    // Either side may carry embedded hex metadata ("Name|#|#hex") — clean
    // both before comparing, since we don't control which format the
    // customer's cart (possibly cached from before this normalization
    // existed) or the stored variant happens to be in.
    const color = cleanColorName(key.slice(dashIdx + 1));
    const selectionColor = selection.color ? cleanColorName(selection.color) : selection.color;
    if (size === selection.size && (!selectionColor || color === selectionColor)) {
      return qty;
    }
  }

  return 0;
}

export function assertStockAvailable(product: ProductInventory, selection: CartSelection) {
  const available = getAvailableQuantity(product, selection);
  if (available < selection.quantity) {
    const variant = [selection.size, selection.color].filter(Boolean).join(" / ");
    throw new Error(
      `Insufficient stock for ${product.name}${variant ? ` (${variant})` : ""}. Available: ${available}`
    );
  }
}
