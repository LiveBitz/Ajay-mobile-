"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { getTotalStock } from "@/lib/inventory";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    slug: string;
    category?: any;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    stock?: number;
    sizes?: string[];
    isNew?: boolean;
    isBestSeller?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  const totalStock = getTotalStock(product.sizes);
  const isOutOfStock = totalStock === 0;

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
      const msg = error.message || "Failed to update wishlist";
      toast({
        title: msg.includes("login") ? "Login Required" : "Error",
        description: msg.includes("login")
          ? "Please login to add items to your wishlist"
          : msg,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full">
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-zinc-50 shrink-0"
      >
        <Image
          src={imgError ? "https://placehold.co/600/f4f4f5/a1a1aa?text=Phone" : product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          quality={85}
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          disabled={isAddingToWishlist}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 z-10 disabled:opacity-50 active:scale-90"
          aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-all duration-300 ease-out",
              isWishlisted(String(product.id))
                ? "fill-brand stroke-brand scale-110"
                : "stroke-zinc-400 scale-100 hover:stroke-zinc-600"
            )}
          />
        </button>

        {/* Discount badge */}
        {product.discount > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-brand text-white text-[11px] font-black px-2 py-0.5 rounded-md tracking-wide z-10 shadow-sm">
            -{product.discount}%
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-semibold text-sm text-zinc-800 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1.5 mt-2 tabular-nums">
            <span className="font-black text-base text-zinc-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-zinc-400 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </Link>

        <Link href={`/product/${product.slug}`} className="block">
          <button
            disabled={isOutOfStock}
            className={cn(
              "w-full h-9 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all duration-200",
              isOutOfStock
                ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? "Out of Stock" : "View Product"}
          </button>
        </Link>
      </div>
    </div>
  );
}
