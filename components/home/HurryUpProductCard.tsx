"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { QuickAddButton } from "@/components/shared/QuickAddButton";

interface HurryUpProductCardProps {
  product: any;
}

export function HurryUpProductCard({ product }: HurryUpProductCardProps) {
  const discount = product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-zinc-100 aspect-square">
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1.5 rounded-md font-black text-xs md:text-sm flex items-center gap-1">
              <span>{discount}%</span>
              <span className="hidden sm:inline">off</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all active:scale-90 group-hover:scale-110"
          >
            <Heart className="w-5 h-5 text-zinc-400 hover:text-red-500 transition-colors" />
          </button>

          {/* Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as any).src = "https://placehold.co/300/f4f4f5/9ca3af?text=" + encodeURIComponent(product.name);
            }}
          />
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-4 flex-1 flex flex-col gap-3">
          {/* Name */}
          <div className="flex-1">
            <p className="text-xs md:text-sm font-bold text-zinc-900 line-clamp-2 group-hover:text-brand transition-colors">
              {product.name}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-black text-zinc-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs md:text-sm text-zinc-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <QuickAddButton product={product} />
        </div>
      </div>
    </Link>
  );
}
