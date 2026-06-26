import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { extractPinelabsStatus, getPinelabsOrderStatus } from "@/lib/pinelabs";
import { confirmPaidOrder, markFailedOrder } from "@/lib/payment-confirmation";
import { revalidatePath } from "next/cache";

function revalidateStockPaths(productSlugs: string[], categorySlugs: string[]) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  for (const slug of productSlugs) {
    revalidatePath(`/product/${slug}`);
  }
  for (const slug of categorySlugs) {
    revalidatePath(`/category/${slug}`);
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(user ? { userId: user.id } : {}),
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentStatus: true,
        status: true,
        pinelabsOrderId: true,
        pinelabsTxnId: true,
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.paymentStatus === "paid" || order.paymentStatus === "failed") {
      return NextResponse.json(order);
    }

    if (order.pinelabsOrderId) {
      const plStatus = await getPinelabsOrderStatus(order.pinelabsOrderId).catch((err) => {
        console.warn("[Payment status] Pine Labs status lookup failed:", (err as Error).message);
        return null;
      });

      if (plStatus) {
        const paymentStatus = extractPinelabsStatus(plStatus);

        if (paymentStatus === "paid") {
          const result = await prisma.$transaction(async (tx) => {
            return confirmPaidOrder({
              tx,
              orderId: order.id,
              pinelabsOrderId: order.pinelabsOrderId,
              pinelabsTxnId: order.pinelabsTxnId,
            });
          });
          if (result.confirmed) revalidateStockPaths(result.productSlugs, result.categorySlugs);
          order.paymentStatus = "paid";
          order.status = "confirmed";
        } else if (paymentStatus === "failed") {
          await prisma.$transaction(async (tx) => {
            await markFailedOrder(tx, order.id);
          });
          order.paymentStatus = "failed";
          order.status = "cancelled";
        }
      }
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("[GET /api/payment/status]", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
