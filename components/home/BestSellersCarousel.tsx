"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  if (!products || products.length === 0) return null;

  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(products.length > 4);

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
      const scrollAmount = 320;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 mb-1.5 tracking-tight">
              Best Selling Phones
            </h2>
            <p className="text-sm md:text-base text-zinc-500 font-medium">
              Shop the most loved devices this season
            </p>
          </div>

          {/* Desktop nav — clean, contained */}
          <div className="hidden md:flex gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "h-9 w-9 rounded-full border border-zinc-200 bg-white shadow-sm transition-all duration-200",
                canScrollLeft
                  ? "hover:shadow-md hover:border-zinc-300 text-zinc-700"
                  : "text-zinc-300 opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "h-9 w-9 rounded-full border border-zinc-200 bg-white shadow-sm transition-all duration-200",
                canScrollRight
                  ? "hover:shadow-md hover:border-zinc-300 text-zinc-700"
                  : "text-zinc-300 opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile nav — in flow */}
        <div className="md:hidden flex items-center justify-end gap-2 mb-4">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "h-9 w-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm transition-all duration-200",
              canScrollLeft ? "text-zinc-700 hover:shadow-md" : "text-zinc-300 opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "h-9 w-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm transition-all duration-200",
              canScrollRight ? "text-zinc-700 hover:shadow-md" : "text-zinc-300 opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product) => (
            <BestSellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

function BestSellerCard({ product }: { product: Product }) {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addItem } = useCart();

  const isOutOfStock = (product.stock || 0) <= 0;

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
      const errorMsg = error.message || "Failed to update wishlist";
      if (errorMsg.includes("login")) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="flex-shrink-0 group">
      <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-lg transition-all duration-300 w-56 md:w-64 lg:w-72 flex flex-col h-full hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            quality={85}
            loading="lazy"
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute bottom-3 left-3 bg-brand text-white font-bold px-2 py-1 rounded-full shadow-sm z-10">
              {product.discount}% OFF
            </Badge>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all z-10 disabled:opacity-50"
            aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isWishlisted(String(product.id)) ? "fill-brand stroke-brand" : "stroke-zinc-500"
              )}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm md:text-base line-clamp-2 mb-2">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-black text-lg text-zinc-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-zinc-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "w-full rounded-xl gap-2 h-10 font-semibold text-xs uppercase tracking-widest transition-all duration-200 bg-zinc-50 text-zinc-800 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300",
              isOutOfStock && "opacity-40 cursor-not-allowed"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            <span className="sm:hidden">{isOutOfStock ? "Out" : "Add"}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
