import { PrismaClient } from "@prisma/client";
import { getTotalStock, cleanColorName } from "@/lib/inventory";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

interface OrderItemWithProduct {
  quantity: number;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    sizes: string[];
    stock: number;
  };
}

/**
 * Deducts stock for a list of order items within a Prisma transaction.
 * Call this when payment is confirmed, NOT at order creation for online payments.
 * Throws if any variant is out of stock (caller should handle or log gracefully).
 */
export async function deductStock(tx: Tx, items: OrderItemWithProduct[]) {
  for (const orderItem of items) {
    const { product } = orderItem;

    if (orderItem.size && Array.isArray(product.sizes)) {
      let matchedVariant = false;
      const updatedSizes = product.sizes.map((sizeStr: string) => {
        if (typeof sizeStr !== "string" || !sizeStr.includes(":")) return sizeStr;

        const colonIdx = sizeStr.lastIndexOf(":");
        const key = sizeStr.slice(0, colonIdx);
        const quantity = sizeStr.slice(colonIdx + 1);

        const dashIdx = key.indexOf("-");
        const isColorVariant = dashIdx !== -1;

        if (isColorVariant) {
          const size = key.slice(0, dashIdx);
          // Either side may carry embedded hex metadata ("Name|#|#hex") —
          // clean both before comparing so matching works regardless of format.
          const color = cleanColorName(key.slice(dashIdx + 1));
          const orderColor = orderItem.color ? cleanColorName(orderItem.color) : orderItem.color;
          if (size === orderItem.size && (!orderColor || color === orderColor)) {
            matchedVariant = true;
            const currentQty = parseInt(quantity) || 0;
            if (currentQty < orderItem.quantity) {
              throw new Error(`Insufficient stock for ${product.name} (${key})`);
            }
            return `${key}:${currentQty - orderItem.quantity}`;
          }
        } else {
          if (key === orderItem.size) {
            matchedVariant = true;
            const currentQty = parseInt(quantity) || 0;
            if (currentQty < orderItem.quantity) {
              throw new Error(`Insufficient stock for ${product.name} (${key})`);
            }
            return `${key}:${currentQty - orderItem.quantity}`;
          }
        }
        return sizeStr;
      });

      if (!matchedVariant) {
        throw new Error(`Selected variant not found for ${product.name}`);
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          sizes: updatedSizes,
          stock: getTotalStock(updatedSizes),
        },
      });
    } else {
      const currentStock = product.stock || 0;
      if (currentStock < orderItem.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      await tx.product.update({
        where: { id: product.id },
        data: { stock: currentStock - orderItem.quantity },
      });
    }
  }
}
