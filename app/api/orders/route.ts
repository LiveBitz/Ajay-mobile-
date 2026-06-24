import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";
import { deductStock } from "@/lib/deduct-stock";
import { calculateBankOfferDiscount, formatBankOfferLabel } from "@/lib/bank-offers";
import { assertStockAvailable } from "@/lib/stock-validation";

type PrismaErrorLike = {
  code?: string;
  message?: string;
};

// ── Zod schema for POST /api/orders ─────────────────────────────────────────

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity:  z.number().int().min(1).max(99),
  size:      z.string().max(20).optional(),
  color:     z.string().max(50).optional(),
});

const addressSchema = z.object({
  name:    z.string().min(1).max(100),
  phone:   z.string().min(7).max(20),
  street:  z.string().min(1).max(200),
  city:    z.string().min(1).max(100),
  state:   z.string().min(1).max(100),
  zipCode: z.string().min(3).max(20),
});

const contactInfoSchema = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(20),
});

const createOrderSchema = z.object({
  items:         z.array(orderItemSchema).min(1).max(50),
  address:       addressSchema,
  contactInfo:   contactInfoSchema,
  paymentMethod: z.enum(["whatsapp", "cod", "online", "pinelabs"]).default("whatsapp"),
  bankOfferId:   z.string().min(1).optional().nullable(),
  couponCode:    z.string().max(30).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;

    // Check if fetching a specific order
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      // Phase 6: Use select structure instead of nested includes
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
          subtotal: true,
          tax: true,
          shipping: true,
          total: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              size: true,
              color: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Verify order belongs to user
      if (order.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json(order);
    }

    // Fetch user's orders with pagination — cap pageSize to prevent resource exhaustion
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * pageSize;

    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            size: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ RATE LIMITING - Prevent order spam
    const clientIp = getClientIp(request);
    const limitCheck = rateLimit(clientIp, RATE_LIMITS.ORDER);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many order requests. Please try again later.",
          retryAfter: Math.ceil(limitCheck.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(limitCheck.resetIn / 1000).toString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;

    // Require verified email before placing orders
    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Please verify your email address before placing an order." },
        { status: 403 }
      );
    }

    // Parse + validate request body with Zod
    let body: z.infer<typeof createOrderSchema>;
    try {
      const raw = await request.json();
      body = createOrderSchema.parse(raw);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request data.", details: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { items, address, contactInfo, paymentMethod, bankOfferId, couponCode } = body;

    // Calculate totals and validate products
    // Phase 7: Batch fetch all products instead of N+1 loop
    const productIds = items.map((item) => item.productId);
    const productsMap = new Map(
      (await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, sizes: true, stock: true }
      })).map(p => [p.id, p])
    );

    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      size: string | null;
      color: string | null;
    }> = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return NextResponse.json(
          { error: "Invalid item in cart" },
          { status: 400 }
        );
      }

      const product = productsMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      try {
        assertStockAvailable(product, item);
      } catch (stockErr) {
        return NextResponse.json(
          { error: (stockErr as Error).message },
          { status: 422 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        size: item.size || null,
        color: item.color || null,
      });
    }

    let discount = 0;
    let appliedOfferLabel: string | null = null;
    let appliedCouponId: string | null = null;

    // ── Coupon code discount (any payment method) ──
    if (couponCode) {
      const coupon = await prisma.couponCode.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (!coupon || !coupon.isActive || coupon.usedAt) {
        return NextResponse.json({ error: "Coupon code is invalid or has already been used." }, { status: 400 });
      }
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return NextResponse.json({ error: "This coupon code has expired." }, { status: 400 });
      }
      if (subtotal < coupon.minOrderAmount) {
        return NextResponse.json(
          { error: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required for this coupon.` },
          { status: 400 }
        );
      }

      let couponDiscount = 0;
      if (coupon.discountType === "flat") {
        couponDiscount = coupon.discountValue;
      } else {
        const raw = (subtotal * coupon.discountValue) / 100;
        couponDiscount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
      }
      discount += Math.round(Math.max(0, Math.min(subtotal, couponDiscount)));
      appliedCouponId = coupon.id;
      appliedOfferLabel = `Coupon ${coupon.code}`;
    }

    if (paymentMethod === "pinelabs" && bankOfferId) {
      const now = new Date();
      const offer = await prisma.bankOffer.findFirst({
        where: {
          id: bankOfferId,
          isActive: true,
          OR: [{ validFrom: null }, { validFrom: { lte: now } }],
          AND: [
            {
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
            },
          ],
        },
      });

      if (!offer) {
        return NextResponse.json(
          { error: "Selected bank offer is no longer available." },
          { status: 400 }
        );
      }

      discount = calculateBankOfferDiscount(offer, subtotal);
      if (discount <= 0) {
        return NextResponse.json(
          { error: "Selected bank offer is not applicable to this order." },
          { status: 400 }
        );
      }
      appliedOfferLabel = formatBankOfferLabel(offer);
    }

    const payableTotal = Math.max(0, subtotal - discount);

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // ✅ Ensure User record exists (for foreign key constraint)
    if (data.user.email) {
      try {
        await prisma.user.upsert({
          where: { id: userId },
          update: {
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split("@")[0] || "User",
          },
          create: {
            id: userId,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split("@")[0] || "User",
          },
        });
      } catch (err) {
        console.error("Error ensuring user exists:", err);
        // Continue even if user creation fails
      }
    }

    // ✅ USE TRANSACTION TO ENSURE ATOMICITY: Order + Stock deduction must both succeed or both fail
    const order = await prisma.$transaction(async (tx) => {
      // Create order with items
      const createdOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          customerName: contactInfo.name,
          customerEmail: contactInfo.email,
          customerPhone: contactInfo.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          subtotal,
          tax: 0,
          shipping: 0,
          total: payableTotal,
          paymentMethod: paymentMethod,
          paymentStatus: "pending",
          status: "pending",
          couponCodeId: appliedCouponId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // For Pine Labs orders, stock is deducted AND the coupon is consumed on
      // payment confirmation (webhook/status). For WhatsApp/COD there is no async
      // payment step, so deduct stock and consume the coupon immediately.
      if (paymentMethod !== "pinelabs") {
        await deductStock(tx, createdOrder.items);
        if (appliedCouponId) {
          await tx.couponCode.update({
            where: { id: appliedCouponId },
            data: { usedAt: new Date(), usedByOrderId: createdOrder.id },
          });
        }
      }

      return createdOrder;
    }, {
      isolationLevel: "Serializable",
    });

    console.log(
      `✅ Order ${orderNumber} created${paymentMethod === "pinelabs" ? " (stock held for payment confirmation)" : " and stock deducted atomically"}${appliedOfferLabel ? ` with offer: ${appliedOfferLabel}` : ""}`
    );

    // ✅ REVALIDATE AFFECTED PATHS FOR REAL-TIME UI UPDATE
    try {
      revalidatePath("/");                    // Home page
      revalidatePath("/category");            // Category pages
      revalidatePath("/cart");                // Cart page
      revalidatePath("/admin/products");      // Admin products
      
      // Revalidate product detail pages
      for (const orderItem of order.items) {
        const product = orderItem.product;
        revalidatePath(`/product/${product.slug}`);
      }
    } catch (err) {
      console.warn("Failed to revalidate paths:", err);
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const prismaError = error as PrismaErrorLike;

    if (prismaError.code === "P2002") {
      return NextResponse.json({ error: "Order already exists." }, { status: 409 });
    }
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    if (prismaError.message?.startsWith("Insufficient stock")) {
      return NextResponse.json({ error: prismaError.message }, { status: 422 });
    }

    // All other errors: log internally, return generic message to client
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }
}
