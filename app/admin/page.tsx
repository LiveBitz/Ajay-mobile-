"use client";

import { BadgeIndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight, Package, Store } from "lucide-react";
import DashboardContent from "@/components/admin/DashboardContent";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 overflow-hidden">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-zinc-900">
            Dashboard Overview
          </h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
            Welcome back, <span className="text-zinc-900 font-bold">Admin</span>! Real-time analytics and business insights.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-zinc-100 rounded-[24px] p-1.5 pr-6 w-fit shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">System Health</p>
            <p className="text-xs font-bold text-zinc-900 mt-0.5">Live Monitoring Active</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <DashboardContent />

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <Package className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-gray-900">Product Management</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage all products</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <BadgeIndianRupee className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-gray-900">Order Management</h3>
          <p className="text-sm text-gray-600 mt-1">Process and track orders</p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
        >
          <Store className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-gray-900">Categories</h3>
          <p className="text-sm text-gray-600 mt-1">Organize product categories</p>
        </Link>
      </div>
    </div>
  );
}
