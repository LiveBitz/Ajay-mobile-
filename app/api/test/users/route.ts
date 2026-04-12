import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// ⚠️ TEST ENDPOINT - No auth required
export async function GET() {
  try {
    console.log("=== Test Users API Called ===");

    // Count records in each table
    const [userCount, orderCount, wishlistCount] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.wishlist.count(),
    ]);

    console.log(`Database counts: Users=${userCount}, Orders=${orderCount}, Wishlists=${wishlistCount}`);

    // Fetch from User table
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
      take: 5,
    });

    console.log("Users from User table:", dbUsers.length);

    if (dbUsers.length === 0) {
      console.log("User table empty, fetching from orders...");

      const orders = await prisma.order.findMany({
        select: {
          userId: true,
          total: true,
          createdAt: true,
          customerEmail: true,
          customerName: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      console.log("Orders found:", orders.length);
      console.log("Sample orders:", orders.slice(0, 2));

      if (orders.length === 0) {
        return NextResponse.json({
          message: "No data in database",
          counts: { userCount, orderCount, wishlistCount },
        });
      }

      return NextResponse.json({
        message: "Data from orders",
        orders: orders,
        counts: { userCount, orderCount, wishlistCount },
      });
    }

    return NextResponse.json({
      message: "Data from User table",
      users: dbUsers,
      counts: { userCount, orderCount, wishlistCount },
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
