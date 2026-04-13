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

  const OrderSummaryCard = ({ className = "", isMobile = false }: { className?: string; isMobile?: boolean }) => (
    <div
      className={cn(
        "bg-white rounded-3xl p-6 sm:p-8 border border-zinc-100 shadow-sm space-y-6",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-950 tracking-tight">
          Order Summary
        </h2>
        <p className="text-xs text-zinc-400 font-medium">Secure checkout with encrypted payment</p>
      </div>

      <div className="space-y-3.5">
        {/* Breakdown rows */}
        <div className="flex justify-between items-center pb-3.5 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Subtotal
          </span>
          <span className="text-sm font-bold text-zinc-900 tabular-nums">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Delivery
          </span>
          <span className="text-sm font-bold text-emerald-600">
            Free
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Tax
          </span>
          <span className="text-sm font-bold text-zinc-900">
            Calculated at checkout
          </span>
        </div>

        <div className="flex justify-between items-center pt-3.5 border-t-2 border-zinc-100">
          <span className="text-sm font-bold uppercase tracking-widest text-zinc-950">
            Total Amount
          </span>
          <span className="text-2xl sm:text-3xl font-black tabular-nums text-zinc-950 tracking-tight">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Link href="/checkout" className="block w-full">
        <Button 
          disabled={items.length === 0}
          className="w-full h-13 sm:h-14 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 font-bold uppercase tracking-widest text-xs sm:text-sm transition-all active:scale-95 gap-2.5 shadow-lg shadow-zinc-950/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-300"
        >
          Secure Checkout Now
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </Link>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure Payment</span>
        </div>
        <span className="text-zinc-300">•</span>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Free Delivery</span>
        </div>
      </div>
    </div>
  );



  /* ── Empty State ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50/30 to-white flex flex-col pt-8 md:pt-0">
        {/* Stepper (skeleton) */}
        <div className="border-b border-zinc-100 bg-white sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8">
            <div className="flex items-center justify-between gap-6">
              {[
                { label: "My Bag", status: "pending" },
                { label: "Order Review", status: "pending" },
                { label: "Checkout", status: "pending" },
              ].map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-200 flex items-center justify-center bg-zinc-50">
                      <span className="text-xs font-bold text-zinc-400">{index + 1}</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-zinc-400 tracking-tight hidden sm:inline">
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className="h-0.5 flex-1 bg-zinc-200 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 sm:py-24 lg:py-32">
          {/* Icon section with glow effect */}
          <div className="relative mb-12 sm:mb-16">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-transparent rounded-full scale-125 blur-3xl opacity-40" />
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-3xl sm:rounded-4xl bg-gradient-to-br from-zinc-50 to-white border-2 border-zinc-100 flex items-center justify-center shadow-xl shadow-zinc-950/5">
              <PackageOpen className="w-14 h-14 sm:w-20 sm:h-20 lg:w-28 lg:h-28 text-zinc-200 stroke-1" />
            </div>
          </div>

          {/* Text content with improved hierarchy */}
          <div className="text-center space-y-5 max-w-lg">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-tight">
                Your Bag is Empty
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed">
                Time to explore our curated collections and add some style to your wardrobe.
              </p>
            </div>

            {/* CTA Button with enhanced styling */}
            <div className="pt-6">
              <Link href="/">
                <Button className="h-13 sm:h-14 lg:h-16 px-8 sm:px-12 lg:px-16 rounded-2xl sm:rounded-3xl bg-zinc-950 hover:bg-zinc-800 active:bg-zinc-900 text-white font-bold uppercase tracking-widest text-xs sm:text-sm transition-all active:scale-95 gap-3 shadow-lg shadow-zinc-950/15 group">
                  Explore Collections
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8 text-xs font-medium text-zinc-500">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
                  Free Delivery
                </Badge>
              </div>
              <div className="hidden sm:block w-px h-4 bg-zinc-200" />
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5" />
                  Easy Returns
                </Badge>
              </div>
            </div>
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
    <div className="bg-white min-h-screen pt-8 md:pt-0">
      {/* ── Stepper ── */}
      <div className="border-b border-zinc-100 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-4 sm:py-6 lg:py-8">
          <div className="relative flex items-center justify-center max-w-lg mx-auto">
            {/* Connector line behind dots */}
            <div className="absolute top-[22px] inset-x-0 h-0.5 bg-gradient-to-r from-zinc-100 via-zinc-100 to-zinc-100 z-0" />

            {stepper.map((step, idx) => (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center gap-2 flex-1"
              >
                {/* Dot */}
                <div
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300",
                    step.status === "complete"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
                      : step.status === "current"
                        ? "bg-zinc-950 border-zinc-950 text-white shadow-lg shadow-zinc-950/20"
                        : "bg-white border-zinc-200 text-zinc-400"
                  )}
                >
                  {step.status === "complete" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{idx + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center transition-colors",
                    step.status === "current"
                      ? "text-zinc-950"
                      : step.status === "complete"
                        ? "text-emerald-600"
                        : "text-zinc-400"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">

          {/* ─── Left · Bag items (8 cols) ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Section header with visual enhancement */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                  Shopping Bag
                </h1>
                <Badge
                  variant="secondary"
                  className="px-3 py-1 rounded-full bg-zinc-100 border-0 text-zinc-700 font-bold text-xs uppercase tracking-wider"
                >
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </Badge>
              </div>
              <p className="text-base text-zinc-500 leading-relaxed">
                {totalItems === 0
                  ? "Your bag is empty"
                  : `Review ${totalItems} ${totalItems === 1 ? "item" : "items"} before proceeding to checkout`}
              </p>
            </div>

            {/* Cart items with enhanced spacing */}
            <div className="space-y-4 sm:space-y-5">
              {items.map((item) => (
                <CartPageItem key={item.id} item={item} />
              ))}
            </div>

            {/* Mobile inline summary (shows between items & continue link) */}
            <div className="lg:hidden space-y-4 pt-6 border-t border-zinc-200">
              <OrderSummaryCard isMobile={true} />
            </div>

            {/* Continue browsing link with enhanced styling */}
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 text-zinc-500 hover:text-zinc-950 font-semibold uppercase tracking-widest transition-all duration-200 group text-sm"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ─── Right · Sticky summary (4 cols, desktop only) ─── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <OrderSummaryCard />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar with enhanced design ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="bg-gradient-to-t from-white via-white/99 to-white border-t border-zinc-200 px-4 sm:px-6 py-4 shadow-2xl shadow-black/5 backdrop-blur-sm">
          <div className="max-w-lg mx-auto flex items-center gap-3 sm:gap-4">
            {/* Price display */}
            <div className="flex flex-col justify-center py-2 min-w-fit">
              <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Total Amount
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight tabular-nums leading-none">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Checkout button */}
            <Link href="/checkout" className="flex-1">
              <Button 
                disabled={items.length === 0}
                className="w-full h-13 sm:h-14 rounded-2xl sm:rounded-3xl bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-zinc-950/10 active:scale-95 gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-950 disabled:hover:text-white"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom padding so content clears the sticky bar on mobile */}
      <div className="h-24 sm:h-20 lg:hidden" />
    </div>
  );
}