"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  stock?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface BestSellersCarouselProps {
  products: Product[];
}

export function BestSellersCarousel({ products }: BestSellersCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState((products?.length ?? 0) > 3);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      carouselRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">

        {/* Header Row */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-0.5 bg-red-600 rounded-full" />
              <span className="text-red-600 text-xs font-bold uppercase tracking-[0.18em]">
                Trending Now
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
              Best Selling Phones
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1.5">
              The most loved devices this season
            </p>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-200",
                canScrollLeft
                  ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-900 hover:border-zinc-900 hover:text-white shadow-sm"
                  : "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-200",
                canScrollRight
                  ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-900 hover:border-zinc-900 hover:text-white shadow-sm"
                  : "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-end gap-2 mb-4">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200",
              canScrollLeft
                ? "border-zinc-300 bg-white text-zinc-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200",
              canScrollRight
                ? "border-zinc-300 bg-white text-zinc-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed opacity-50"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex gap-5 md:gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ touchAction: "pan-x" }}
        >
          {products.map((product, index) => (
            <BestSellerCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function BestSellerCard({ product, index }: { product: Product; index: number }) {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addItem } = useCart();

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
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
      if (error?.message?.includes("login")) {
        toast({
          title: "Login Required",
          description: "Please login to add items to your wishlist",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="flex-shrink-0 group w-[280px] md:w-[300px] lg:w-[320px]">
      <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-zinc-100 shadow-sm md:hover:shadow-xl md:hover:shadow-zinc-200/80 md:hover:-translate-y-1.5 transition-all duration-300">

        {/* Image — Link wraps only the image, buttons are siblings */}
        <div className="relative overflow-hidden bg-zinc-50" style={{ paddingBottom: "95%" }}>
          <Link
            href={`/product/${product.slug}`}
            className="absolute inset-0 block"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 md:group-hover:scale-105"
              quality={85}
              loading="lazy"
            />
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white font-black text-xs tracking-wide shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.45)",
                }}
              >
                <Zap size={10} style={{ fill: "#fbbf24", stroke: "none" }} />
                <span>{product.discount}% OFF</span>
              </div>
            </div>
          )}

          {/* Bestseller tag */}
          {product.isBestSeller && !product.isNew && !product.discount && (
            <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-wider pointer-events-none">
              🔥 Hot
            </div>
          )}

          {/* Wishlist — outside Link, z-20 so it intercepts its own taps */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 disabled:opacity-50 bg-white/80 backdrop-blur-md md:hover:bg-white shadow-sm md:hover:shadow-md"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={14}
              strokeWidth={2}
              style={{
                fill: wishlisted ? "#ef4444" : "none",
                stroke: wishlisted ? "#ef4444" : "#9f9f9f",
                transition: "all 0.3s ease",
              }}
            />
          </button>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
              <span className="text-zinc-700 text-xs font-bold uppercase tracking-widest border border-zinc-300 px-4 py-2 rounded-full bg-white shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-5 gap-4">
          <Link href={`/product/${product.slug}`} className="flex-1 space-y-2">
            <h3 className="font-semibold text-zinc-900 text-base leading-snug line-clamp-2 md:group-hover:text-red-600 transition-colors duration-200">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-black text-xl text-zinc-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-zinc-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Savings pill */}
            {savings > 0 && (
              <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                You save ₹{savings.toLocaleString("en-IN")}
              </div>
            )}
          </Link>

          {/* Add to Cart — outside Link */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200",
              isOutOfStock
                ? "bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed"
                : isAddingToCart
                ? "bg-red-600 border-red-600 text-white scale-[0.98]"
                : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-900 hover:border-zinc-900 hover:text-white hover:shadow-md"
            )}
          >
            <ShoppingBag
              className={cn("w-4 h-4", isAddingToCart && "animate-bounce")}
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
    </div>
  );
}