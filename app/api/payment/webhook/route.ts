import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { extractPinelabsStatus } from "@/lib/pinelabs";
import { confirmPaidOrder, markFailedOrder } from "@/lib/payment-confirmation";
import { revalidatePath } from "next/cache";

function revalidateStockPaths(productSlugs: string[], categorySlugs: string[]) {
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/admin/products");
  for (const slug of productSlugs) {
    revalidatePath(`/product/${slug}`);
  }
  for (const slug of categorySlugs) {
    revalidatePath(`/category/${slug}`);
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function verifySignature(rawBody: string, receivedSig: string, secret: string): boolean {
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(receivedSig.toLowerCase(), "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookSecret = process.env.PINELABS_WEBHOOK_SECRET;

  if (webhookSecret) {
    const receivedSig =
      req.headers.get("x-verify") ??
      req.headers.get("x-plural-signature") ??
      req.headers.get("x-pinelabs-signature") ??
      "";

    if (!receivedSig) {
      console.warn("[Webhook] Missing signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!verifySignature(rawBody, receivedSig, webhookSecret)) {
      console.warn("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error("[Webhook] PINELABS_WEBHOOK_SECRET must be set in production");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  } else {
    console.warn("[Webhook] PINELABS_WEBHOOK_SECRET not set; accepting unsigned dev webhook");
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const data = asObject(body.data);
    const firstPayment = Array.isArray(data.payments) ? asObject(data.payments[0]) : {};
    const pluralOrderId = readString(
      body.order_id,
      body.plural_order_id,
      data.order_id,
      data.plural_order_id
    );
    const merchantTxnId = readString(
      body.merchant_order_reference,
      body.unique_merchant_txn_id,
      data.merchant_order_reference,
      data.unique_merchant_txn_id
    );
    const txnId = readString(
      body.transaction_id,
      body.txn_id,
      body.payment_id,
      firstPayment.id,
      firstPayment.transaction_id
    );

    console.log("[Webhook] received", {
      pluralOrderId,
      merchantTxnId,
      txnId,
      status: body.status ?? data.status ?? firstPayment.status,
    });

    if (!pluralOrderId && !merchantTxnId) {
      return NextResponse.json({ ok: true });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(pluralOrderId ? [{ pinelabsOrderId: pluralOrderId }] : []),
          ...(merchantTxnId ? [{ orderNumber: merchantTxnId }] : []),
        ],
      },
      select: {
        id: true,
        paymentStatus: true,
        pinelabsOrderId: true,
      },
    });

    if (!order) {
      console.warn("[Webhook] Order not found", { pluralOrderId, merchantTxnId });
      return NextResponse.json({ ok: true });
    }

    const paymentStatus = extractPinelabsStatus(body);

    if (paymentStatus === "paid") {
      const result = await prisma.$transaction(async (tx) => {
        return confirmPaidOrder({
          tx,
          orderId: order.id,
          pinelabsOrderId: pluralOrderId ?? order.pinelabsOrderId,
          pinelabsTxnId: txnId,
        });
      });
      if (result.confirmed) revalidateStockPaths(result.productSlugs, result.categorySlugs);
    } else if (paymentStatus === "failed") {
      await prisma.$transaction(async (tx) => {
        await markFailedOrder(tx, order.id);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook error]", err);
    return NextResponse.json({ ok: true });
  }
}
