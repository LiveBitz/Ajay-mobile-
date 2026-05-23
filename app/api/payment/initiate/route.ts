import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { createPinelabsOrder } from "@/lib/pinelabs";

function getPaymentAmountPaisa(realTotal: number): number {
  const realAmountPaisa = Math.round(realTotal * 100);
  const override = process.env.PINELABS_TEST_AMOUNT_PAISA;

  if (process.env.NODE_ENV !== "production" && override) {
    const testAmount = Number(override);
    if (Number.isInteger(testAmount) && testAmount > 0) {
      return testAmount;
    }
    console.warn("[Pine Labs] Ignoring invalid PINELABS_TEST_AMOUNT_PAISA value");
  }

  return realAmountPaisa;
}

function getRequestOrigin(req: NextRequest): string {
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const forwardedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return req.nextUrl.origin;
}

function isLocalUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function getPaymentReturnBaseUrl(req: NextRequest): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (process.env.NODE_ENV === "production" && configuredSiteUrl && !isLocalUrl(configuredSiteUrl)) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }
  return getRequestOrigin(req).replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already paid — reject
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    // ── Idempotency: if a Pine Labs order already exists for this order,
    //    return the stored checkout URL instead of creating a new one.
    //    This prevents duplicate charges when the client retries.
    if (order.pinelabsOrderId && order.pinelabsCheckoutUrl) {
      return NextResponse.json({ checkoutUrl: order.pinelabsCheckoutUrl });
    }

    const siteUrl = getPaymentReturnBaseUrl(req);
    const returnUrl = `${siteUrl}/payment/return?orderId=${order.id}`;

    const amountPaisa = getPaymentAmountPaisa(order.total);

    const result = await createPinelabsOrder({
      merchantTxnId: order.orderNumber,
      amountPaisa,
      orderDesc: `Order #${order.orderNumber} — Priya Mobile Park`,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      street: order.street,
      city: order.city,
      state: order.state,
      zipCode: order.zipCode,
      returnUrl,
      failureReturnUrl: returnUrl,
    });

    // Persist the Pine Labs order ID and checkout URL atomically
    await prisma.order.update({
      where: { id: order.id },
      data: {
        pinelabsOrderId: result.pinelabsOrderId,
        pinelabsCheckoutUrl: result.checkoutUrl,
        paymentMethod: "pinelabs",
        paymentStatus: "pending",
      },
    });

    return NextResponse.json({ checkoutUrl: result.checkoutUrl });
  } catch (err: unknown) {
    console.error("[POST /api/payment/initiate]", err);
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
