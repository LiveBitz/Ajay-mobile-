"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  PackageOpen,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartPageItem } from "@/components/cart/CartPageItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, totalPrice, totalItems } = useCart();

  const stepper = [
    { id: "bag", label: "My Bag", status: "complete" },
    { id: "review", label: "Order Review", status: "current" },
    { id: "checkout", label: "Checkout", status: "pending" },
  ];

  /* ── Reusable sub-components ── */

  const OrderSummaryCard = ({ className = "" }: { className?: string }) => (
    <div
      className={cn(
        "bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-zinc-100 shadow-sm space-y-6",
        className
      )}
    >
      <h2 className="text-base font-bold text-zinc-950 tracking-tight">
        Order Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
            Bag Total
          </span>
          <span className="text-sm font-bold tabular-nums">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
            Delivery
          </span>
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
            Free
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
            Tax
          </span>
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">
            Included
          </span>
        </div>

        <Separator className="bg-zinc-100" />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-950">
            Total Amount
          </span>
          <span className="text-2xl font-bold tabular-nums tracking-tight">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/checkout">
          <Button 
            disabled={items.length === 0}
            className="w-full h-12 sm:h-14 rounded-xl bg-zinc-900 text-white hover:bg-zinc-950 disabled:bg-zinc-300 disabled:hover:bg-zinc-300 font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 gap-3 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Checkout Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <div className="flex items-center justify-center gap-4 pt-1 opacity-30 grayscale">
          <ShieldCheck className="w-4 h-4" />
          <Truck className="w-4 h-4" />
          <CreditCard className="w-4 h-4" />
        </div>
      </div>
    </div>
  );

  const PromoCodeCard = ({ className = "" }: { className?: string }) => (
    <div
      className={cn(
        "p-6 sm:p-8 border border-zinc-100 rounded-2xl sm:rounded-3xl bg-zinc-50/50 space-y-3",
        className
      )}
    >
      <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        Promo Code
      </h5>
      <div className="flex gap-2 h-11">
        <input
          type="text"
          placeholder="Enter code"
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 text-[11px] font-semibold uppercase tracking-widest outline-none focus:border-zinc-400 transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-400 placeholder:font-normal"
        />
        <Button
          variant="ghost"
          className="rounded-xl px-5 bg-zinc-900 text-white text-[11px] font-bold hover:bg-zinc-950 transition-all shadow-sm shrink-0"
        >
          Apply
        </Button>
      </div>
    </div>
  );

  /* ── Empty State ── */
  if (items.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-16 bg-white">
        <div className="relative group mb-10">
          <div className="absolute inset-0 bg-zinc-100 rounded-full scale-110 blur-3xl opacity-30" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <PackageOpen className="w-10 h-10 sm:w-14 sm:h-14 text-zinc-200" />
          </div>
        </div>

        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
            Your Bag is Empty
          </h1>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            Discover our curated collections and build your elite wardrobe. Your
            next favourite piece awaits.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button className="h-12 sm:h-14 px-8 rounded-xl bg-zinc-900 hover:bg-zinc-950 text-white font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 gap-3 shadow-sm">
                Explore Collections
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Cart Layout ── */
  return (
    /*
     * Mobile:  single column, sticky bottom CTA bar
     * Desktop: two columns (8/4), sticky sidebar
     */
    <div className="bg-white min-h-screen">
      {/* ── Stepper ── */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-6 sm:py-8">
          <div className="relative flex items-center justify-center max-w-xs sm:max-w-sm mx-auto">
            {/* Connector line behind dots */}
            <div className="absolute top-[18px] inset-x-0 h-px bg-zinc-100 z-0" />

            {stepper.map((step, idx) => (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center gap-2 flex-1"
              >
                {/* Dot */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border text-[11px] font-bold transition-all",
                    step.status === "complete"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                      : step.status === "current"
                        ? "bg-zinc-950 border-zinc-950 text-white shadow-md"
                        : "bg-white border-zinc-100 text-zinc-300"
                  )}
                >
                  {step.status === "complete" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-tight",
                    step.status === "current"
                      ? "text-zinc-950"
                      : "text-zinc-300"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">

          {/* ─── Left · Bag items (8 cols) ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Section header */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                  Shopping Bag
                </h1>
                <Badge
                  variant="outline"
                  className="px-2.5 py-0.5 rounded-full border-zinc-200 text-zinc-400 font-bold text-[10px] uppercase"
                >
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                Review your selections before checking out.
              </p>
            </div>

            {/* Cart items */}
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <CartPageItem key={item.id} item={item} />
              ))}
            </div>

            {/* Mobile inline summary (shows between items & continue link) */}
            <div className="lg:hidden space-y-4 pt-4 border-t border-zinc-100">
              <OrderSummaryCard />
              <PromoCodeCard />
            </div>

            {/* Continue browsing */}
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-800 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[11px] font-semibold uppercase tracking-widest">
                  Continue Shopping
                </span>
              </Link>
            </div>
          </div>

          {/* ─── Right · Sticky summary (4 cols, desktop only) ─── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <OrderSummaryCard />
              <PromoCodeCard />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="bg-white/90 backdrop-blur-xl border-t border-zinc-100 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-4 max-w-md mx-auto">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                Total
              </span>
              <span className="text-xl font-bold text-zinc-950 tracking-tight tabular-nums">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <Button className="flex-1 h-12 rounded-xl bg-zinc-950 text-white font-bold uppercase tracking-widest text-[11px] shadow-sm active:scale-95 gap-2.5 transition-all">
              Checkout Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding so content clears the sticky bar on mobile */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}