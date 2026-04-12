// app/admin/page.tsx
import { BadgeIndianRupee, Package, Store, Users } from "lucide-react";
import DashboardContent from "@/components/admin/DashboardContent";
import Link from "next/link";
import prisma from "@/lib/prisma";

// ✅ Server component — no "use client"
export default async function AdminPage() {

  // ✅ Fetch all dashboard data in parallel
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalCategories,
    recentOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),        // ✅ This was missing — users never fetched
    prisma.category.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
    }),
  ]);

  const stats = {
    totalProducts,
    totalOrders,
    totalUsers,
    totalCategories,
    recentOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
  };

  const quickLinks = [
    {
      href: "/admin/products",
      icon: Package,
      label: "Product Management",
      sub: "View and manage all products",
      color: "text-blue-600",
      hover: "hover:border-blue-200",
      count: totalProducts,
    },
    {
      href: "/admin/orders",
      icon: BadgeIndianRupee,
      label: "Order Management",
      sub: "Process and track orders",
      color: "text-emerald-600",
      hover: "hover:border-emerald-200",
      count: totalOrders,
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users Management",
      sub: "View customer accounts",
      color: "text-orange-600",
      hover: "hover:border-orange-200",
      count: totalUsers,       // ✅ Now shows real user count
    },
    {
      href: "/admin/categories",
      icon: Store,
      label: "Categories",
      sub: "Organize product categories",
      color: "text-purple-600",
      hover: "hover:border-purple-200",
      count: totalCategories,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 pb-16 px-3 sm:px-4 lg:px-0">

      {/* ── Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-600 rounded-full" />
          <span className="text-red-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            Admin
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500 text-sm">
          Welcome back,{" "}
          <span className="text-zinc-900 font-bold">Admin</span>! Real-time analytics and business insights.
        </p>
      </div>

      {/* ── Quick Access Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {quickLinks.map(({ href, icon: Icon, label, sub, color, hover, count }) => (
          <Link
            key={href}
            href={href}
            className={`bg-white p-4 md:p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md ${hover} transition-all duration-200 group flex flex-col gap-3`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              {/* ✅ Live count badge */}
              <span className="text-xs font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full tabular-nums">
                {count.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm leading-tight">{label}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Dashboard Content ── */}
      {/* ✅ DashboardContent fetches its own data via API */}
      <DashboardContent />
    </div>
  );
}