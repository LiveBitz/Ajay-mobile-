"use client";

import React, { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductSelection } from "./ProductSelection";

interface VariantPrice {
  price: number;
  originalPrice: number;
}

interface PriceDisplayProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    sizes: string[];
    colors: string[];
    variantPricing?: Record<string, VariantPrice> | null;
  };
}

export function PriceDisplay({ product }: PriceDisplayProps) {
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentOriginalPrice, setCurrentOriginalPrice] = useState(product.originalPrice);

  const handlePriceChange = useCallback((price: number, originalPrice: number) => {
    setCurrentPrice(price);
    setCurrentOriginalPrice(originalPrice);
  }, []);

  const savings = currentOriginalPrice - currentPrice;
  const discountPct =
    currentOriginalPrice > 0 && savings > 0
      ? Math.round((savings / currentOriginalPrice) * 100)
      : 0;

  return (
    <>
      {/* ── Dynamic Pricing Block ── */}
      <div className="bg-zinc-50 rounded-2xl p-5 space-y-3 border border-zinc-100">
        <div className="flex items-baseline flex-wrap gap-3">
          <span
            key={currentPrice}
            className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          {discountPct > 0 && (
            <>
              <span className="text-xl text-zinc-400 line-through font-medium tabular-nums">
                ₹{currentOriginalPrice.toLocaleString("en-IN")}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                <Zap size={11} className="text-emerald-500" />
                {discountPct}% OFF
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-200">
          {savings > 0 && (
            <span
              key={savings}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full animate-in fade-in duration-300"
            >
              You save ₹{savings.toLocaleString("en-IN")}
            </span>
          )}
          <p className="text-xs text-zinc-400 font-medium">Inclusive of all taxes</p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-zinc-100" />

      {/* ── Product Selection (with price change callback) ── */}
      <ProductSelection
        product={product}
        onPriceChange={handlePriceChange}
      />
    </>
  );
}
