"use client";

import React from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, Heart, ShieldCheck, Truck } from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartPageItemProps {
  item: CartItem;
}

export function CartPageItem({ item }: CartPageItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-zinc-100 hover:border-zinc-200/80 hover:shadow-lg hover:shadow-zinc-950/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      {/* ── High-Fidelity Product Image ── */}
      <div className="relative w-full sm:w-28 md:w-32 lg:w-36 h-48 sm:h-40 md:h-48 lg:h-56 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
        <Image 
          src={item.image} 
          alt={item.name} 
          fill 
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          quality={75}
          loading="lazy"
        />
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* ── Product Details & Actions ── */}
      <div className="flex-1 flex flex-col justify-between w-full">
        
        {/* Top section: Title, SKU, Price */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg lg:text-xl font-black text-zinc-950 leading-tight tracking-tight">
                  {item.name}
                </h4>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-zinc-900/5 border border-zinc-200 text-zinc-500 uppercase tracking-widest">
                  SKU_{item.productId.slice(-4).toUpperCase()}
                </span>
              </div>
              
              {/* Size and Color badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {item.size && (
                  <span className="text-xs font-semibold text-zinc-600 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    Size: <span className="font-bold text-zinc-900">{item.size.toUpperCase()}</span>
                  </span>
                )}
                {item.color && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span 
                      className="w-3 h-3 rounded-full ring-2 ring-white ring-offset-1 flex-shrink-0" 
                      style={{ backgroundColor: item.color.toLowerCase(), boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} 
                    />
                    <span className="font-bold text-zinc-950 capitalize">{item.color}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price info - Right aligned */}
            <div className="text-right shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-black text-zinc-950 tracking-tight tabular-nums">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium tracking-tight mt-1">
                ₹{item.price.toLocaleString("en-IN")} each
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section: Quantity controls & Actions */}
        <div className="mt-5 sm:mt-6 flex items-center justify-between gap-4 pt-5 sm:pt-6 border-t border-zinc-100">
          
          {/* Quantity selector */}
          <div className="flex items-center bg-zinc-50/80 border border-zinc-200 rounded-2xl h-11 px-1.5 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(item.id, -1)}
              className="w-9 h-9 rounded-xl hover:bg-white hover:text-zinc-950 text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center text-sm font-bold text-zinc-950 tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(item.id, 1)}
              className="w-9 h-9 rounded-xl hover:bg-white hover:text-zinc-950 text-zinc-400 transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action buttons: Wishlist & Remove */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-11 h-11 rounded-xl text-zinc-300 hover:text-rose-500 hover:bg-rose-50/50 transition-all hidden sm:inline-flex"
              title="Save for later"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => removeItem(item.id)}
              className="h-11 px-4 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-all flex items-center gap-2 group/remove font-semibold text-sm"
            >
              <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
