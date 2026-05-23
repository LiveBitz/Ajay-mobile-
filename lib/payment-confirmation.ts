import type { PrismaClient } from "@prisma/client";
import { deductStock } from "@/lib/deduct-stock";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface ConfirmPaymentInput {
  tx: Tx;
  orderId: string;
  pinelabsOrderId?: string | null;
  pinelabsTxnId?: string | null;
}

interface ConfirmPaymentResult {
  confirmed: boolean;
  productSlugs: string[];
  categorySlugs: string[];
}

export async function confirmPaidOrder({
  tx,
  orderId,
  pinelabsOrderId,
  pinelabsTxnId,
}: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
  const transition = await tx.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: "pending",
    },
    data: {
      paymentStatus: "paid",
      status: "confirmed",
      ...(pinelabsOrderId ? { pinelabsOrderId } : {}),
      ...(pinelabsTxnId ? { pinelabsTxnId } : {}),
    },
  });

  if (transition.count !== 1) return { confirmed: false, productSlugs: [], categorySlugs: [] };

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, sizes: true, stock: true } },
        },
      },
    },
  });

  if (!order) return { confirmed: true, productSlugs: [], categorySlugs: [] };

  try {
    await deductStock(tx, order.items);
  } catch (stockErr) {
    console.warn("[Payment] Stock deduction warning:", (stockErr as Error).message);
    await tx.order.update({
      where: { id: orderId },
      data: { status: "stock_review" },
    });
  }

  const products = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      product: {
        select: {
          slug: true,
          category: { select: { slug: true, parent: { select: { slug: true } } } },
        },
      },
    },
  });

  return {
    confirmed: true,
    productSlugs: products.map((item) => item.product.slug),
    categorySlugs: [
      ...new Set(
        products.flatMap((item) =>
          [item.product.category.slug, item.product.category.parent?.slug].filter(
            (slug): slug is string => Boolean(slug)
          )
        )
      ),
    ],
  };
}

export async function markFailedOrder(tx: Tx, orderId: string): Promise<boolean> {
  const transition = await tx.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: "pending",
    },
    data: {
      paymentStatus: "failed",
      status: "cancelled",
    },
  });

  return transition.count === 1;
}
