import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

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
  paymentMethod: z.enum(["whatsapp", "cod", "online"]).default("whatsapp"),
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
  } catch (error: any) {
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

    const { items, address, contactInfo, paymentMethod } = body;

    // Calculate totals and validate products
    // Phase 7: Batch fetch all products instead of N+1 loop
    const productIds = (items as any[]).map((item: any) => item.productId);
    const productsMap = new Map(
      (await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, sizes: true, stock: true }
      })).map(p => [p.id, p])
    );

    let subtotal = 0;
    const orderItems: any[] = [];

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
          total: subtotal,
          paymentMethod: paymentMethod,
          paymentStatus: "pending",
          status: "pending",
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

      // ✅ DEDUCT STOCK ATOMICALLY (within transaction)
      for (const orderItem of createdOrder.items) {
        const product = orderItem.product;
        
        if (orderItem.size && Array.isArray(product.sizes)) {
          // Handle both size-only and size-color variants: "S:10" or "S-White:5"
          const updatedSizes = product.sizes.map((sizeStr: string) => {
            if (typeof sizeStr === "string" && sizeStr.includes(":")) {
              const [key, quantity] = sizeStr.split(":");
              
              // Check if this is a size-color variant (S-White:5) or just size (S:10)
              const isColorVariant = key.includes("-");
              
              if (isColorVariant) {
                // For "S-White:5" format
                const [size, color] = key.split("-");
                
                // Match if size matches AND color matches (if color exists in orderItem)
                if (size === orderItem.size && (!orderItem.color || color === orderItem.color)) {
                  const currentQty = parseInt(quantity) || 0;
                  if (currentQty < orderItem.quantity) throw new Error(`Insufficient stock for ${product.name} (${key})`);
                  const newQty = currentQty - orderItem.quantity;
                  return `${key}:${newQty}`;
                }
              } else {
                // For old "S:10" format - backwards compatibility
                if (key === orderItem.size && !key.includes("-")) {
                  const currentQty = parseInt(quantity) || 0;
                  if (currentQty < orderItem.quantity) throw new Error(`Insufficient stock for ${product.name} (${key})`);
                  const newQty = currentQty - orderItem.quantity;
                  return `${key}:${newQty}`;
                }
              }
            }
            return sizeStr;
          });

          // Update product in database
          await tx.product.update({
            where: { id: product.id },
            data: { sizes: updatedSizes },
          });
        } else {
          // Legacy: deduct from total stock field
          const currentStock = product.stock || 0;
          if (currentStock < orderItem.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
          const newStock = currentStock - orderItem.quantity;
          await tx.product.update({
            where: { id: product.id },
            data: { stock: newStock },
          });
        }
      }

      return createdOrder;
    }, {
      isolationLevel: "Serializable", // ✅ Highest isolation level to prevent race conditions
    });

    console.log(`✅ Order ${orderNumber} created and stock deducted atomically`);

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
  } catch (error: any) {
    console.error("Error creating order:", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Order already exists." }, { status: 409 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    // For stock errors thrown inside the transaction, surface the message
    if (error.message?.startsWith("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // All other errors: log internally, return generic message to client
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }
}
