import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get month and year from query parameters (default to current month)
    const searchParams = req.nextUrl.searchParams;
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    
    const today = new Date();
    const currentMonth = monthParam ? parseInt(monthParam) : today.getMonth();
    const currentYear = yearParam ? parseInt(yearParam) : today.getFullYear();
    
    // Calculate first and last day of the selected month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get total products and categories
    const [productCount, categoryCount, orderCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
    ]);

    // Get total revenue from orders for the selected month
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true,
      },
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get orders by status for the selected month
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    // Get revenue for the selected month (daily breakdown)
    const revenueByDayRaw = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true,
      },
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate revenue by date
    const revenueByDateMap = new Map<string, number>();
    revenueByDayRaw.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      const current = revenueByDateMap.get(dateStr) || 0;
      revenueByDateMap.set(dateStr, current + (order.total || 0));
    });

    // Transform data for charts
    const dailyRevenueData = Array.from(revenueByDateMap.entries()).map(
      ([dateStr, total]) => ({
        date: new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: Math.round(total),
        fullDate: dateStr,
      })
    );

    // Fill missing days of the month with 0
    const dateMap = new Map();
    const daysInMonth = lastDay.getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateStr = date.toISOString().split("T")[0];
      const found = dailyRevenueData.find((d) => d.fullDate === dateStr);
      dateMap.set(
        dateStr,
        found ? found.revenue : 0
      );
    }

    const filledRevenueData = Array.from(dateMap.entries()).map(([date, revenue]) => ({
      date: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue,
    }));

    // Get top products by orders
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProductsData = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        return {
          name: product?.name || "Unknown Product",
          quantity: item._sum.quantity || 0,
          value: (item._sum.quantity || 0) * (product?.price || 0),
        };
      })
    );

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Get order count by status
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersByStatus.forEach((item) => {
      const status = item.status.toLowerCase();
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts] = item._count.id;
      }
    });

    // Get new customers for the selected month
    const newCustomersCount = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      distinct: ["customerEmail"],
    });

    return NextResponse.json({
      month: currentMonth,
      year: currentYear,
      stats: {
        totalProducts: productCount,
        totalCategories: categoryCount,
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue),
        newCustomers: newCustomersCount.length,
      },
      ordersByStatus: statusCounts,
      revenueChart: filledRevenueData,
      topProducts: topProductsData,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        createdAt: new Date(order.createdAt).toLocaleDateString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
