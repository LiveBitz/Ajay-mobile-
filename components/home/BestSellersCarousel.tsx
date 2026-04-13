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
      carouselRef.current.scrollTo({
        left: direction === "left" ? scrollPosition - scrollAmount : scrollPosition + scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section
      className="relative py-14 md:py-20 lg:py-24 overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Subtle red glow — top centre */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(220,38,38,0.12) 0%, transparent 70%)" }}
      />
      {/* Thin red hairline at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.5), transparent)" }}
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: "#dc2626" }} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#dc2626" }}>
                Trending Now
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
              style={{ color: "#ffffff" }}
            >
              Best Selling Phones
            </h2>
            <p className="text-sm font-medium mt-1.5" style={{ color: "#71717a" }}>
              The most loved devices this season
            </p>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              style={{
                height: 40, width: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${canScrollLeft ? "#3f3f46" : "#27272a"}`,
                backgroundColor: canScrollLeft ? "#18181b" : "#111111",
                color: canScrollLeft ? "#a1a1aa" : "#3f3f46",
                cursor: canScrollLeft ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { if (canScrollLeft) { Object.assign((e.currentTarget as HTMLButtonElement).style, { backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#fff" }); } }}
              onMouseLeave={e => { if (canScrollLeft) { Object.assign((e.currentTarget as HTMLButtonElement).style, { backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#a1a1aa" }); } }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              style={{
                height: 40, width: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${canScrollRight ? "#3f3f46" : "#27272a"}`,
                backgroundColor: canScrollRight ? "#18181b" : "#111111",
                color: canScrollRight ? "#a1a1aa" : "#3f3f46",
                cursor: canScrollRight ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { if (canScrollRight) { Object.assign((e.currentTarget as HTMLButtonElement).style, { backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#fff" }); } }}
              onMouseLeave={e => { if (canScrollRight) { Object.assign((e.currentTarget as HTMLButtonElement).style, { backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#a1a1aa" }); } }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-end gap-2 mb-5">
          {(["left", "right"] as const).map((dir) => {
            const can = dir === "left" ? canScrollLeft : canScrollRight;
            return (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                disabled={!can}
                style={{
                  height: 36, width: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${can ? "#3f3f46" : "#27272a"}`,
                  backgroundColor: can ? "#18181b" : "#111111",
                  color: can ? "#a1a1aa" : "#3f3f46",
                  cursor: can ? "pointer" : "not-allowed",
                }}
              >
                {dir === "left"
                  ? <ChevronLeft style={{ width: 14, height: 14 }} />
                  : <ChevronRight style={{ width: 14, height: 14 }} />}
              </button>
            );
          })}
        </div>

        {/* ── Carousel ── */}
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="carousel-touch-pan flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-3 scrollbar-hide"
        >
          {products.map((product, index) => (
            <BestSellerCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .carousel-touch-pan { touch-action: manipulation; }
      `}</style>
    </section>
  );
}

/* ── Individual Card ── */
function BestSellerCard({ product, index }: { product: Product; index: number }) {
  const [hovered, setHovered] = useState(false);
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
        toast({ title: "Login Required", description: "Please login to add items to your wishlist", variant: "destructive", duration: 3000 });
      }
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
      addItem({ productId: String(product.id), name: product.name, price: product.price, image: product.image });
      toast({ title: "Added to Cart", description: `${product.name} has been added to your cart.` });
    } catch {
      toast({ title: "Error", description: "Failed to add product to cart", variant: "destructive" });
    } finally {
      setTimeout(() => setIsAddingToCart(false), 700);
    }
  };

  return (
    <div
      className="flex-shrink-0"
      style={{ width: "clamp(220px, 28vw, 300px)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden"
        style={{
          backgroundColor: hovered ? "#1c1c1e" : "#18181b",
          border: hovered ? "1px solid #3f3f46" : "1px solid #27272a",
          boxShadow: hovered
            ? "0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(220,38,38,0.1)"
            : "0 2px 8px rgba(0,0,0,0.3)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Image ── */}
        <div className="relative overflow-hidden" style={{ paddingBottom: "90%", backgroundColor: "#212121" }}>
          <Link href={`/product/${product.slug}`} className="absolute inset-0 block">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              style={{ transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }}
              quality={85}
              loading="lazy"
            />
            {/* Bottom gradient on hover */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
          </Link>

          {/* Discount badge — top left */}
          {product.discount > 0 && (
            <div
              className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 2px 8px rgba(220,38,38,0.4)",
              }}
            >
              <Zap style={{ width: 9, height: 9, fill: "#fbbf24", stroke: "none" }} />
              <span className="text-white font-black text-[10px] tracking-wide">{product.discount}% OFF</span>
            </div>
          )}

          {/* New badge */}
          {product.isNew && !product.discount && (
            <div className="absolute top-3 left-3 z-10 pointer-events-none px-2 py-1 rounded-lg"
              style={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }}>
              <span className="text-white font-bold text-[10px] uppercase tracking-wider">New</span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 disabled:opacity-50"
            style={{
              backgroundColor: "rgba(9,9,11,0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={13}
              strokeWidth={2}
              style={{
                fill: wishlisted ? "#ef4444" : "none",
                stroke: wishlisted ? "#ef4444" : "#a1a1aa",
                transition: "all 0.2s ease",
              }}
            />
          </button>

          {/* Out of stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}>
              <span className="text-zinc-300 text-xs font-bold uppercase tracking-widest border border-zinc-600 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(9,9,11,0.8)" }}>
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <Link href={`/product/${product.slug}`} className="flex-1 space-y-1.5">
            <h3
              className="font-semibold text-sm leading-snug line-clamp-2"
              style={{ color: hovered ? "#ffffff" : "#e4e4e7", transition: "color 0.2s ease" }}
            >
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-black text-lg" style={{ color: "#ffffff" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs line-through" style={{ color: "#52525b" }}>
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {savings > 0 && (
              <div
                className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: "#34d399", backgroundColor: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                Save ₹{savings.toLocaleString("en-IN")}
              </div>
            )}
          </Link>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-200"
            style={
              isOutOfStock
                ? { backgroundColor: "#111111", border: "1px solid #27272a", color: "#52525b", cursor: "not-allowed" }
                : isAddingToCart
                ? { backgroundColor: "#dc2626", border: "1px solid #dc2626", color: "#fff" }
                : hovered
                ? { backgroundColor: "#dc2626", border: "1px solid #dc2626", color: "#fff" }
                : { backgroundColor: "#27272a", border: "1px solid #3f3f46", color: "#a1a1aa" }
            }
          >
            <ShoppingBag
              className={cn("w-3.5 h-3.5", isAddingToCart && "animate-bounce")}
            />
            <span>
              {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
