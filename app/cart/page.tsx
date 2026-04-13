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
        "bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm space-y-5",
        className
      )}
    >
      <div className="space-y-0.5">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
          Order Summary
        </h2>
        <p className="text-xs text-zinc-400 font-medium">Secure checkout with encrypted payment</p>
      </div>

      <div className="space-y-3">
        {/* Breakdown rows */}
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Subtotal
          </span>
          <span className="text-sm font-bold text-zinc-900 tabular-nums">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Delivery
          </span>
          <span className="text-sm font-bold text-emerald-600">
            Free
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Tax
          </span>
          <span className="text-sm font-semibold text-zinc-500">
            At checkout
          </span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
          <span className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            Total
          </span>
          <span className="text-xl font-black tabular-nums text-zinc-900 tracking-tight">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Link href="/checkout" className="block w-full">
        <button
          disabled={items.length === 0}
          style={{ backgroundColor: items.length === 0 ? undefined : '#dc2626' }}
          className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300 hover:opacity-90"
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Secure Payment</span>
        </div>
        <span className="text-zinc-200">•</span>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <Truck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Free Delivery</span>
        </div>
      </div>
    </div>
  );



  /* ── Empty State ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-8 md:pt-0">
        {/* Stepper (skeleton) */}
        <div className="border-b border-zinc-100 bg-white sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-5">
            <div className="relative flex items-center justify-center max-w-sm mx-auto">
              <div className="absolute top-[20px] inset-x-0 h-0.5 bg-zinc-100 z-0" />
              {[
                { label: "My Bag" },
                { label: "Order Review" },
                { label: "Checkout" },
              ].map((step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-10 h-10 rounded-full border-2 border-zinc-200 flex items-center justify-center bg-white">
                    <span className="text-xs font-bold text-zinc-400">{index + 1}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 tracking-wide hidden sm:inline">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <div className="w-24 h-24 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-8">
            <ShoppingBag className="w-10 h-10 text-zinc-300" strokeWidth={1.5} />
          </div>

          <div className="text-center space-y-3 max-w-sm">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
              Your cart is empty
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Looks like you haven't added anything yet. Explore our collection and find something you love.
            </p>

            <div className="pt-5">
              <Link href="/">
                <button
                  style={{ backgroundColor: '#dc2626' }}
                  className="h-12 px-8 rounded-xl text-white font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
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
                    "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300",
                    step.status === "complete"
                      ? "border-transparent text-white"
                      : step.status === "current"
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                        : "bg-white border-zinc-200 text-zinc-400"
                  )}
                  style={step.status === "complete" ? { backgroundColor: '#dc2626', borderColor: '#dc2626' } : undefined}
                >
                  {step.status === "complete" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{idx + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-center transition-colors",
                    step.status === "current"
                      ? "text-zinc-900"
                      : step.status === "complete"
                        ? "text-zinc-500"
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

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 flex items-center justify-between z-40 lg:hidden">
        <div className="flex flex-col justify-center min-w-fit">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Total Amount
          </span>
          <span className="text-xl font-black text-zinc-900 tracking-tight tabular-nums leading-none">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Checkout button */}
        <Link href="/checkout" className="flex-1 ml-4">
          <button
            disabled={items.length === 0}
            style={items.length > 0 ? { backgroundColor: '#dc2626' } : undefined}
            className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300 hover:opacity-90"
          >
            Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Bottom padding so content clears the sticky bar on mobile */}
      <div className="h-24 sm:h-20 lg:hidden" />
    </div>
  );
}