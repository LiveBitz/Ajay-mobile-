import React from "react";
import { 
  ShoppingBag, 
  Users, 
  BadgeIndianRupee, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from "lucide-react";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

async function getStats() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  
  return {
    productCount,
    categoryCount,
    totalSales: 0, 
    activeUsers: 0,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Products", value: stats.productCount, icon: Package, change: "+12%", trend: "up" },
    { label: "Total Categories", value: stats.categoryCount, icon: ShoppingBag, change: "0%", trend: "neutral" },
    { label: "Total Revenue", value: "₹0", icon: BadgeIndianRupee, change: "-2%", trend: "down" },
    { label: "Active Customers", value: "0", icon: Users, change: "+5%", trend: "up" },
  ];

  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 overflow-hidden">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-zinc-900">
            Overview
          </h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
            Welcome back, <span className="text-zinc-900 font-bold">Admin</span>! Your digital flagship is operating at peak performance.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-100/50 transition-all group overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-400 group-hover:bg-brand/5 group-hover:text-brand transition-all">
                <card.icon className="w-7 h-7" />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm",
                card.trend === "up" ? "bg-emerald-50/50 text-emerald-600 border-emerald-100" : 
                card.trend === "down" ? "bg-rose-50/50 text-rose-600 border-rose-100" : "bg-zinc-50 text-zinc-600 border-zinc-100"
              )}>
                {card.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : 
                 card.trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {card.change}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">{card.label}</p>
              <h3 className="text-4xl font-bold font-heading mt-2 text-zinc-900 tabular-nums">{card.value}</h3>
            </div>
            {/* Minimal Background Decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-50/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-zinc-100 shadow-sm h-[400px] flex flex-col items-center justify-center space-y-6 relative overflow-hidden group">
          <div className="w-20 h-20 bg-brand/5 rounded-[32px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
            <TrendingUp className="w-10 h-10 text-brand" />
          </div>
          <div className="text-center relative z-10 max-w-sm px-4">
            <h4 className="font-bold text-2xl text-zinc-900 tracking-tight">Sales Analytics</h4>
            <p className="text-zinc-400 font-medium leading-relaxed mt-2">Intelligence gathering in progress. Start selling to see your growth curves here.</p>
          </div>
          {/* Faint Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#f1f1f1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-30" />
        </div>
        
        <div className="bg-white p-10 rounded-[48px] border border-zinc-100 shadow-sm flex flex-col h-[400px] overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <h4 className="font-bold text-xl text-zinc-900">Recent Activity</h4>
             <p className="text-[10px] font-bold text-brand uppercase tracking-widest px-3 py-1 bg-brand/5 rounded-full">Live</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-40">
            <div className="w-20 h-20 bg-zinc-50/50 rounded-full flex items-center justify-center">
               <ShoppingBag className="w-10 h-10 text-zinc-300" />
            </div>
            <p className="text-zinc-400 font-bold text-sm tracking-tight">No recent orders identified.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
