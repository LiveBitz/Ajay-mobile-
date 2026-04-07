import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

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
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
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

    // Fetch all user's orders
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
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
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;
    const body = await request.json();
    const { items, address, contactInfo } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!address || !contactInfo) {
      return NextResponse.json(
        { error: "Missing address or contact info" },
        { status: 400 }
      );
    }

    // Validate address fields
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return NextResponse.json(
        { error: "Invalid address information" },
        { status: 400 }
      );
    }

    // Calculate totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return NextResponse.json(
          { error: "Invalid item in cart" },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

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

    // Create order with items
    const order = await prisma.order.create({
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
        paymentMethod: "cod",
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

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    
    // Provide more detailed error information
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Order already exists" },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
