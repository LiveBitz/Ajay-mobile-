import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAvailableQuantity } from "@/lib/stock-validation";

interface AvailabilityRequestItem {
  id?: unknown;
  productId?: unknown;
  size?: unknown;
  color?: unknown;
  quantity?: unknown;
}

interface NormalisedCartItem {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  quantity: number;
}

function normaliseCartItem(item: AvailabilityRequestItem) {
  if (typeof item.id !== "string" || typeof item.productId !== "string") {
    return null;
  }

  return {
    id: item.id,
    productId: item.productId,
    size: typeof item.size === "string" ? item.size : null,
    color: typeof item.color === "string" ? item.color : null,
    quantity:
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(1, Math.floor(item.quantity))
        : 1,
    };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestItems: NormalisedCartItem[] = Array.isArray(body?.items)
      ? body.items
          .map((item: AvailabilityRequestItem) => normaliseCartItem(item))
          .filter((item: NormalisedCartItem | null): item is NormalisedCartItem => Boolean(item))
      : [];

    if (requestItems.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const productIds = Array.from(
      new Set(requestItems.map((item) => item.productId))
    );

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isArchived: false },
      select: { id: true, name: true, stock: true, sizes: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    const availability = requestItems.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        return {
          id: item.id,
          productId: item.productId,
          availableQuantity: 0,
          inStock: false,
          canIncrement: false,
        };
      }

      const availableQuantity = getAvailableQuantity(product, item!);

      return {
        id: item.id,
        productId: item.productId,
        availableQuantity,
        inStock: availableQuantity > 0,
        canIncrement: item.quantity < availableQuantity,
      };
    });

    return NextResponse.json({ items: availability });
  } catch (error) {
    console.error("[cart availability]", error);
    return NextResponse.json(
      { error: "Failed to check cart stock" },
      { status: 500 }
    );
  }
}
