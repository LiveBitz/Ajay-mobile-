"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Settings, 
  LogOut,
  ChevronRight,
  Store,
  Users,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Featured Categories", href: "/admin/featured-categories", icon: Star },
  { label: "Banners", href: "/admin/banners", icon: Store },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 pb-4">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold font-heading text-lg leading-tight tracking-tight text-zinc-900">Admin</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Dashboard v1.0</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all group",
                isActive 
                  ? "text-brand bg-brand/5 shadow-sm shadow-brand/5" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-brand" : "text-zinc-400"
              )} />
              <span className="flex-1">{item.label}</span>
              {isActive ? (
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-5 py-4 rounded-2xl text-zinc-600 font-bold bg-zinc-50 hover:bg-zinc-100 transition-all group border border-zinc-100"
        >
          <Store className="w-5 h-5" />
          <span>View Store</span>
        </Link>
        
        <button
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 transition-all group"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
