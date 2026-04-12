"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { getTotalStock } from "@/lib/inventory";

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
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addItem } = useCart();

  const totalStock = getTotalStock(product.sizes);
  const isOutOfStock = totalStock === 0;
  const wishlisted = isWishlisted(String(product.id));
  const savings = product.originalPrice - product.price;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToWishlist(true);
    try {
      await toggleWishlist(String(product.id));
      toast({
        title: wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
        description: wishlisted
          ? `${product.name} removed from your wishlist`
          : `${product.name} added to your wishlist`,
        duration: 2000,
      });
    } catch (error: any) {
      const msg = error?.message || "Failed to update wishlist";
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    try {
      addItem({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        duration: 2000,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsAddingToCart(false), 700);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:shadow-zinc-200/60 hover:-translate-y-1.5 transition-all duration-300 h-full">

      {/* ── Image Area ── */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative overflow-hidden bg-zinc-50 shrink-0"
        style={{ paddingBottom: "100%" }}
      >
        <Image
          src={
            imgError
              ? "https://placehold.co/600/f4f4f5/a1a1aa?text=Phone"
              : product.image
          }
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          quality={85}
          loading="lazy"
        />

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* ── Discount Badge ── */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-white font-black text-[10px] tracking-wide shadow-lg"
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              boxShadow: "0 2px 8px rgba(220,38,38,0.4)",
            }}
          >
            <Zap size={9} style={{ fill: "#fbbf24", stroke: "none" }} />
            {product.discount}% OFF
          </div>
        )}

        {/* ── New / Bestseller Badge ── */}
        {product.isNew && !product.discount && (
          <div className="absolute top-3 left-3 z-10 bg-zinc-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
            New
          </div>
        )}
        {product.isBestSeller && !product.isNew && !product.discount && (
          <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
            🔥 Hot
          </div>
        )}

        {/* ── Wishlist Button ── */}
        <button
          onClick={handleWishlistClick}
          disabled={isAddingToWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md transition-all duration-300 active:scale-90 disabled:opacity-50"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={14}
            strokeWidth={2}
            style={{
              fill: wishlisted ? "#ef4444" : "none",
              stroke: wishlisted ? "#ef4444" : "#a1a1aa",
              transition: "all 0.3s ease",
            }}
          />
        </button>

        {/* ── Out of Stock Overlay ── */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest border border-zinc-300 px-3 py-1.5 rounded-full bg-white shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Info Area ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + Price */}
        <Link href={`/product/${product.slug}`} className="flex-1 space-y-1.5">
          <h3 className="font-semibold text-sm text-zinc-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors duration-200">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="font-black text-base text-zinc-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Savings pill */}
          {savings > 0 && (
            <div className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              You save ₹{savings.toLocaleString("en-IN")}
            </div>
          )}
        </Link>

        {/* ── Add to Cart Button ── */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className={cn(
            "w-full h-9 rounded-xl text-[11px] font-bold uppercase tracking-wider",
            "flex items-center justify-center gap-1.5 border",
            "transition-all duration-200",
            isOutOfStock
              ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
              : isAddingToCart
              ? "border-red-600 bg-red-600 text-white scale-[0.98]"
              : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-900 hover:border-zinc-900 hover:text-white hover:shadow-md"
          )}
        >
          <ShoppingBag
            className={cn("w-3.5 h-3.5", isAddingToCart && "animate-bounce")}
          />
          <span>
            {isOutOfStock
              ? "Out of Stock"
              : isAddingToCart
              ? "Adding..."
              : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
}