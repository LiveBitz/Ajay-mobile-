import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // API routes are excluded from middleware — auth must be enforced here explicitly
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // ✅ FIRST: Try to fetch from User table
    let dbUsers: any = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
        wishlists: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        joinedDate: "desc",
      },
    });

    console.log("Users from User table:", dbUsers.length);

    // ✅ FALLBACK: If User table is empty, fetch from Orders and build user data
    if (dbUsers.length === 0) {
      console.log("User table is empty, syncing from orders...");

      const orderUsers = new Map<
        string,
        {
          id: string;
          email: string;
          name: string;
          totalOrders: number;
          totalSpent: number;
          lastOrder: Date | null;
          joinedDate: Date;
          wishlistCount: number;
        }
      >();

      // Fetch all orders
      const orders = await prisma.order.findMany({
        select: {
          userId: true,
          total: true,
          createdAt: true,
          customerEmail: true,
          customerName: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by user
      for (const order of orders) {
        if (!order.customerEmail) continue;

        if (!orderUsers.has(order.userId)) {
          orderUsers.set(order.userId, {
            id: order.userId,
            email: order.customerEmail,
            name: order.customerName || "User",
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: null,
            joinedDate: order.createdAt,
            wishlistCount: 0,
          });
        }

        const user = orderUsers.get(order.userId)!;
        user.totalOrders += 1;
        user.totalSpent += order.total;
        if (!user.lastOrder || order.createdAt > user.lastOrder) {
          user.lastOrder = order.createdAt;
        }
      }

      // Fetch wishlist counts
      const wishlists = await prisma.wishlist.findMany({
        select: { userId: true },
      });

      const wishlistCounts = new Map<string, number>();
      for (const item of wishlists) {
        wishlistCounts.set(
          item.userId,
          (wishlistCounts.get(item.userId) || 0) + 1
        );
      }

      // Apply wishlist counts
      for (const [userId, count] of wishlistCounts.entries()) {
        const user = orderUsers.get(userId);
        if (user) {
          user.wishlistCount = count;
        }
      }

      // Convert to array
      dbUsers = Array.from(orderUsers.values());

      // ✅ ALSO: Sync these users to User table for next time
      try {
        for (const user of dbUsers) {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email,
              name: user.name,
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          });
        }
        console.log("Synced", dbUsers.length, "users to User table");
      } catch (err) {
        console.error("Error syncing users to User table:", err);
        // Continue - we have the data even if sync fails
      }
    }

    // ✅ MapAPP users to the response format
    const users = dbUsers.map((user: any) => {
      // Check if data came from User table (has .orders) or from fallback (already calculated)
      const hasOrdersRelation = Array.isArray(user.orders);
      
      const totalOrders = hasOrdersRelation ? user.orders?.length || 0 : user.totalOrders || 0;
      const totalSpent = hasOrdersRelation 
        ? user.orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0
        : user.totalSpent || 0;
      const lastOrder = hasOrdersRelation 
        ? user.orders?.[0]?.createdAt || null 
        : user.lastOrder || null;
      const wishlistCount = hasOrdersRelation ? user.wishlists?.length || 0 : user.wishlistCount || 0;

      return {
        id: user.id,
        email: user.email,
        name: user.name || "User",
        totalOrders,
        totalSpent,
        lastOrder: lastOrder ? (typeof lastOrder === 'string' ? lastOrder : lastOrder.toISOString()) : null,
        joinedDate: user.joinedDate ? (typeof user.joinedDate === 'string' ? user.joinedDate : user.joinedDate.toISOString()) : new Date().toISOString(),
        wishlistCount,
      };
    });

    const totalRevenue = users.reduce((sum: number, u: any) => sum + u.totalSpent, 0);
    const totalOrders = users.reduce((sum: number, u: any) => sum + u.totalOrders, 0);

    return NextResponse.json({
      users,
      totalUsers: users.length,
      totalRevenue,
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
