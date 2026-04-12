"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface HurryUpProductCardProps {
  product: any;
}

export function HurryUpProductCard({ product }: HurryUpProductCardProps) {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addItem } = useCart();

  const discount =
    product.discount ||
    Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );

  const isOutOfStock = (product.stock ?? 0) <= 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToWishlist(true);
    try {
      await toggleWishlist(String(product.id));
      const wishlisted = isWishlisted(String(product.id));
      toast({
        title: wishlisted ? "Added to Wishlist" : "Removed from Wishlist",
        description: wishlisted
          ? `${product.name} has been added to your wishlist`
          : `${product.name} has been removed from your wishlist`,
        duration: 2000,
      });
    } catch (error: any) {
      const msg = error.message || "";
      toast({
        title: msg.includes("login") ? "Login Required" : "Error",
        description: msg.includes("login")
          ? "Please login to add items to your wishlist"
          : msg || "Failed to update wishlist",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div
        className="relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          backgroundColor: "#18181b",
          border: "1px solid #3f3f46",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#71717a";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#3f3f46";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.4)";
        }}
      >

        {/* ── Image ── */}
        <div className="relative aspect-square overflow-hidden shrink-0" style={{ backgroundColor: "#27272a" }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/300/18181b/52525b?text=Phone";
            }}
          />

          {/* Discount badge — top-left, prominent */}
          {discount > 0 && (
            <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 bg-brand text-white text-[9px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg tracking-wide shadow-lg">
              -{discount}%
            </div>
          )}

          {/* Wishlist button — top-right */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            aria-label="Toggle wishlist"
            className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 disabled:opacity-50 hover:bg-black/40 active:scale-90"
            style={{ backgroundColor: "rgba(24,24,27,0.85)", border: "1px solid #52525b" }}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ease-out",
                isWishlisted(String(product.id))
                  ? "fill-brand stroke-brand scale-110"
                  : "fill-none scale-100 hover:scale-110"
              )}
              style={{
                stroke: isWishlisted(String(product.id)) ? undefined : "white",
                strokeWidth: 1.5
              }}
            />
          </button>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
              <span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col flex-1 p-2 sm:p-2.5 md:p-3 gap-2 sm:gap-2.5">
          {/* Name */}
          <p className="text-zinc-100 text-xs sm:text-sm font-semibold line-clamp-2 leading-snug">
            {product.name}
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 tabular-nums">
            <span className="text-white text-sm sm:text-base font-black">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-zinc-500 text-[10px] sm:text-xs line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to Cart — brand red, feels urgent */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={cn(
              "mt-auto w-full h-8 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200",
              isOutOfStock
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-brand text-white hover:bg-red-700 active:scale-95"
            )}
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">
              {isAddingToCart ? "Adding…" : isOutOfStock ? "Sold Out" : "Add to Cart"}
            </span>
            <span className="sm:hidden">
              {isAddingToCart ? "Adding" : isOutOfStock ? "Sold Out" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
