"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  ArrowRight,
  PackageOpen,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Color swatch helper ───────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  "midnight black": "#121212",
  "starlight white": "#F5F5F0",
  "titanium grey": "#8E8E93",
  "arctic silver": "#C0C0C0",
  "pacific blue": "#0070BB",
  "deep purple": "#4E3C58",
  "rose gold": "#B76E79",
  graphite: "#41424C",
  "emerald green": "#046307",
  "sunset orange": "#FD5E28",
  "natural titanium": "#BEBEBE",
  copper: "#B87333",
  black: "#121212",
  white: "#F5F5F0",
  blue: "#0070BB",
  red: "#E53E3E",
  green: "#046307",
  yellow: "#ECC94B",
  purple: "#4E3C58",
  pink: "#B76E79",
  gray: "#8E8E93",
  grey: "#8E8E93",
  silver: "#C0C0C0",
  gold: "#D4AF37",
};

const getColorHex = (color: string): string =>
  COLOR_MAP[color.toLowerCase()] ?? color;

const isLightColor = (color: string): boolean =>
  ["white", "silver", "starlight", "arctic", "cream", "beige", "gold"].some(
    (w) => color.toLowerCase().includes(w)
  );

// ─── CartSheet ─────────────────────────────────────────────────────────────────

export function CartSheet() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
    isOpen,
    setIsOpen,
  } = useCart();

  const totalSavings = items.reduce((acc, item) => {
    const original = (item as any).originalPrice ?? item.price;
    return acc + (original - item.price) * item.quantity;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className={cn(
          "flex flex-col p-0",
          "w-full sm:max-w-[420px]",
          "bg-zinc-50 border-l border-zinc-100",
          "shadow-2xl shadow-black/10"
        )}
      >
        {/* ── Header ── */}
        <SheetHeader className="shrink-0 px-5 py-4 sm:px-6 sm:py-5 bg-white border-b border-zinc-100">
          <SheetTitle className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>

            {/* Title + subtitle */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-black tracking-tight text-zinc-950 uppercase leading-none">
                Your Collective
              </p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                {totalItems === 0
                  ? "No items yet"
                  : `${totalItems} item${totalItems > 1 ? "s" : ""} curated`}
              </p>
            </div>

            {/* ✕ Close button sits naturally at end — no badge overlapping it */}
          </SheetTitle>
        </SheetHeader>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center px-8 py-12 text-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center">
                  <PackageOpen className="w-10 h-10 text-zinc-200" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-2 max-w-[220px]">
                <h3 className="text-base font-black text-zinc-950 tracking-tight uppercase">
                  Collective is Empty
                </h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Your curation awaits. Start exploring the latest drops.
                </p>
              </div>

              <Button
                onClick={() => setIsOpen(false)}
                className="h-12 px-8 rounded-full bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-950/10"
              >
                Start Exploring
              </Button>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Free Delivery
                  </span>
                </div>
                <div className="w-px h-3 bg-zinc-200" />
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Secure Pay
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Items List */
            <ScrollArea className="h-full">
              <div className="px-4 sm:px-5 py-4 space-y-3">
                {items.map((item, idx) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                    onDecrement={() => updateQuantity(item.id, -1)}
                    onIncrement={() => updateQuantity(item.id, 1)}
                    index={idx}
                  />
                ))}
                <div className="h-2" />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <SheetFooter className="shrink-0 flex-col p-0 bg-white border-t border-zinc-100">
            <div className="px-5 sm:px-6 pt-4 pb-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Subtotal
                </span>
                <span className="text-base font-black text-zinc-950 tracking-tight">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    You Save
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    −₹{totalSavings.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Shipping
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  Calculated at checkout
                </span>
              </div>

              <Separator className="bg-zinc-100 my-1" />

              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs font-black text-zinc-950 uppercase tracking-widest">
                  Estimated Total
                </span>
                <span className="text-xl font-black text-zinc-950 tracking-tighter">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 space-y-2.5">
              <Link
                href="/checkout"
                className="block w-full"
                onClick={() => setIsOpen(false)}
              >
                <Button
                  className={cn(
                    "w-full h-13 sm:h-14 rounded-2xl",
                    "bg-zinc-950 hover:bg-zinc-800",
                    "text-white font-black uppercase text-[11px] tracking-[0.2em]",
                    "shadow-xl shadow-zinc-950/10",
                    "transition-all active:scale-[0.98]",
                    "flex items-center justify-center gap-2.5",
                    "group"
                  )}
                >
                  <ShieldCheck className="w-4 h-4 opacity-70" />
                  Secure Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>

              <Link
                href="/cart"
                className="block w-full"
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 rounded-2xl",
                    "border-zinc-200 bg-zinc-50",
                    "text-zinc-500 hover:text-zinc-950 hover:bg-white",
                    "font-black uppercase text-[10px] tracking-[0.15em]",
                    "transition-all active:scale-[0.98]"
                  )}
                >
                  View Full Cart
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Truck className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Free Delivery
                  </span>
                </div>
                <div className="w-px h-2.5 bg-zinc-200" />
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Secure Payment
                  </span>
                </div>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── CartItem ──────────────────────────────────────────────────────────────────

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
    [key: string]: any;
  };
  onRemove: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  index: number;
}

function CartItem({
  item,
  onRemove,
  onDecrement,
  onIncrement,
  index,
}: CartItemProps) {
  const colorHex = item.color ? getColorHex(item.color) : null;
  const colorLight = item.color ? isLightColor(item.color) : false;
  const lineTotal = item.price * item.quantity;
  const originalTotal = ((item as any).originalPrice ?? item.price) * item.quantity;
  const hasSaving = originalTotal > lineTotal;

  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl border border-zinc-100",
        "p-3 sm:p-4",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        "animate-in fade-in slide-in-from-right-2 duration-300"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Image */}
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            quality={80}
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Name + Remove */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-black text-zinc-950 leading-snug tracking-tight line-clamp-2 flex-1">
              {item.name}
            </h4>
            <button
              onClick={onRemove}
              aria-label="Remove item"
              className={cn(
                "shrink-0 w-6 h-6 rounded-lg",
                "flex items-center justify-center",
                "text-zinc-300 hover:text-rose-500 hover:bg-rose-50",
                "transition-all active:scale-90"
              )}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Variant badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {item.size && (
              <span className="inline-flex items-center h-5 px-2 rounded-full bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                {item.size}
              </span>
            )}
            {item.color && colorHex && (
              <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-zinc-100">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full border shrink-0",
                    colorLight ? "border-zinc-300" : "border-transparent"
                  )}
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                  {item.color}
                </span>
              </span>
            )}
          </div>

          {/* Quantity + Price */}
          <div className="flex items-center justify-between mt-auto pt-1">
            {/* Stepper */}
            <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden">
              <button
                onClick={onDecrement}
                aria-label="Decrease quantity"
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center",
                  "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100",
                  "transition-all active:scale-90"
                )}
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="w-7 sm:w-8 text-center text-[11px] font-black text-zinc-950 select-none">
                {item.quantity}
              </span>

              <button
                onClick={onIncrement}
                aria-label="Increase quantity"
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center",
                  "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100",
                  "transition-all active:scale-90"
                )}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-sm font-black text-zinc-950 leading-none">
                ₹{lineTotal.toLocaleString("en-IN")}
              </p>
              {hasSaving && (
                <p className="text-[9px] font-bold text-zinc-400 line-through mt-0.5">
                  ₹{originalTotal.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}