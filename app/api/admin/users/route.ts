import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getPaginationParams, formatPaginatedResponse } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user (verify admin access)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ PHASE 2: Smart pagination instead of hard-coded limits
    const searchParams = request.nextUrl.searchParams;
    const { take, skip, page } = getPaginationParams({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    // Phase 7: Use pagination parameters instead of hardcoding (enables full user browsing)
    const ordersPerPage = 100;
    const orders = await prisma.order.findMany({
      select: {
        userId: true,
        id: true,
        total: true,
        createdAt: true,
        customerEmail: true,
        customerName: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ordersPerPage,
      skip: (page - 1) * ordersPerPage,
    });

    // Phase 7: Paginated aggregations with skip
    const addresses = await prisma.address.findMany({
      select: {
        userId: true,
        createdAt: true,
      },
      distinct: ["userId"],
      take: 100,
      skip: (page - 1) * 100,
    });

    // Phase 7: Paginated wishlist aggregation
    const wishlists = await prisma.wishlist.findMany({
      select: {
        userId: true,
      },
      distinct: ["userId"],
      take: 100,
      skip: (page - 1) * 100,
    });

    // Aggregate user data
    const userMap = new Map<
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

    // Add order data
    orders.forEach((order) => {
      if (!userMap.has(order.userId)) {
        userMap.set(order.userId, {
          id: order.userId,
          email: order.customerEmail,
          name: order.customerName,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: null,
          joinedDate: order.createdAt,
          wishlistCount: 0,
        });
      }

      const user = userMap.get(order.userId)!;
      user.totalOrders += 1;
      user.totalSpent += order.total;
      if (!user.lastOrder || order.createdAt > user.lastOrder) {
        user.lastOrder = order.createdAt;
      }
    });

    // Add address join date (if earlier than order date)
    addresses.forEach((address) => {
      if (!userMap.has(address.userId)) {
        userMap.set(address.userId, {
          id: address.userId,
          email: "",
          name: "",
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: null,
          joinedDate: address.createdAt,
          wishlistCount: 0,
        });
      }

      const user = userMap.get(address.userId)!;
      if (address.createdAt < user.joinedDate) {
        user.joinedDate = address.createdAt;
      }
    });

    // Add wishlist count
    wishlists.forEach((wishlist) => {
      if (userMap.has(wishlist.userId)) {
        const user = userMap.get(wishlist.userId)!;
        user.wishlistCount += 1;
      }
    });

    const users = Array.from(userMap.values())
      .filter((u) => u.email)
      .sort((a, b) => b.joinedDate.getTime() - a.joinedDate.getTime());

    return NextResponse.json({
      users,
      totalUsers: users.length,
      totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
      totalOrders: users.reduce((sum, u) => sum + u.totalOrders, 0),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
