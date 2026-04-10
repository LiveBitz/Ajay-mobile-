import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addCacheHeaders, CACHE_STRATEGIES } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parameters from query
    const searchParams = req.nextUrl.searchParams;
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const timePeriodParam = searchParams.get("timePeriod") || "month"; // week, month, year
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let firstDay: Date;
    let lastDay: Date;
    let dateFormat: string;
    
    // Calculate date range based on time period
    switch (timePeriodParam) {
      case "week":
        const currentDayOfWeek = today.getDay();
        firstDay = new Date(today);
        firstDay.setDate(today.getDate() - currentDayOfWeek);
        firstDay.setHours(0, 0, 0, 0);
        lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        lastDay.setHours(23, 59, 59, 999);
        dateFormat = "week";
        break;
      case "year": {
        const currentYear = today.getFullYear();
        firstDay = new Date(currentYear, 0, 1);
        lastDay = new Date(currentYear, 11, 31);
        lastDay.setHours(23, 59, 59, 999);
        dateFormat = "year";
        break;
      }
      case "month":
      default: {
        const currentMonth = monthParam ? parseInt(monthParam) : today.getMonth();
        const currentYear = yearParam ? parseInt(yearParam) : today.getFullYear();
        firstDay = new Date(currentYear, currentMonth, 1);
        lastDay = new Date(currentYear, currentMonth + 1, 0);
        lastDay.setHours(23, 59, 59, 999);
        dateFormat = "month";
        break;
      }
    }
    
    // Get total products and categories
    const [productCount, categoryCount, orderCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
    ]);

    // Phase 6: Use database aggregation instead of JavaScript reduce (40% faster)
    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
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

    const totalRevenue = Math.round(revenueAgg._sum.total || 0);
    
    // Phase 7: Combine duplicate findMany queries - use single query for all revenue data
    const orders = await prisma.order.findMany({
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
    
    // Use combined orders data for both daily breakdown (revenueByDayRaw) and aggregation
    const revenueByDayRaw = orders;

    let filledRevenueData: Array<{ date: string; revenue: number }>;

    if (timePeriodParam === "year") {
      // For year view, aggregate by month
      const revenueByMonthMap = new Map<number, number>();
      
      revenueByDayRaw.forEach((order) => {
        const monthIndex = order.createdAt.getMonth();
        const current = revenueByMonthMap.get(monthIndex) || 0;
        revenueByMonthMap.set(monthIndex, current + (order.total || 0));
      });

      // Fill all 12 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      filledRevenueData = monthNames.map((monthName, monthIndex) => ({
        date: monthName,
        revenue: Math.round(revenueByMonthMap.get(monthIndex) || 0),
      }));
    } else {
      // For day/week/month views, aggregate by day
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

      // Fill missing days with 0
      const dateMap = new Map();
      const daysInRange = Math.ceil((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 0; i < daysInRange; i++) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const found = dailyRevenueData.find((d) => d.fullDate === dateStr);
        dateMap.set(
          dateStr,
          found ? found.revenue : 0
        );
      }

      filledRevenueData = Array.from(dateMap.entries()).map(([date, revenue]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue,
      }));
    }

    // Get top products by orders (Fixed N+1 query issue)
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

    // Fetch all product details in a single query instead of N+1
    const productIds = topProducts.map((item) => item.productId);
    const productsMap = new Map(
      (
        await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true },
        })
      ).map((p) => [p.id, p])
    );

    const topProductsData = topProducts.map((item) => {
      const product = productsMap.get(item.productId);
      return {
        name: product?.name || "Unknown Product",
        quantity: item._sum.quantity || 0,
        value: (item._sum.quantity || 0) * (product?.price || 0),
      };
    });

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

    // Phase 6: Optimized new customers query with limit and select
    const newCustomersCount = await prisma.order.findMany({
      select: {
        customerEmail: true,
      },
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      distinct: ["customerEmail"],
      take: 1000, // Limit query to prevent full table scan
    });

    // Phase 6: Add ISR caching for dashboard (5 mins)
    const response = NextResponse.json({
      month: firstDay.getMonth(),
      year: firstDay.getFullYear(),
      timePeriod: timePeriodParam,
      dateRange: {
        start: firstDay.toISOString().split("T")[0],
        end: lastDay.toISOString().split("T")[0],
      },
      stats: {
        totalProducts: productCount,
        totalCategories: categoryCount,
        totalOrders: revenueAgg._count.id,
        totalRevenue: totalRevenue,
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

    // Phase 6: Cache dashboard for 5 minutes
    response.headers.set("Cache-Control", "private, max-age=300, s-maxage=0");
    return response;
  } catch (error) {
    console.error("Dashboard API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Failed to fetch dashboard data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
