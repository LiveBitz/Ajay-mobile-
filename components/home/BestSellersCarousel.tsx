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
        <div className="mb-10 md:mb-12 lg:mb-14">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-2">
                Best Selling Phones
              </h2>
              <p className="text-stone-600 font-medium">Shop the most loved devices this season</p>
            </div>

            {/* Navigation Arrows - Desktop/Tablet Only */}
            <div className="hidden md:flex gap-3 items-center">
              {/* Left Indicator */}
              {canScrollLeft && (
                <div className="absolute -left-8 h-12 w-1 rounded-full bg-gradient-to-b from-brand/50 to-brand/0 animate-pulse" />
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={cn(
                  "h-12 w-12 rounded-full border-2 shadow-md transition-all duration-300 hover:scale-110 active:scale-95",
                  canScrollLeft
                    ? "border-brand bg-white hover:shadow-xl hover:border-brand hover:bg-gradient-to-br hover:from-brand/10 hover:to-brand/5 hover:text-brand text-brand"
                    : "border-stone-200 bg-stone-50 text-stone-300 opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={cn(
                  "h-12 w-12 rounded-full border-2 shadow-md transition-all duration-300 hover:scale-110 active:scale-95",
                  canScrollRight
                    ? "border-brand bg-white hover:shadow-xl hover:border-brand hover:bg-gradient-to-br hover:from-brand/10 hover:to-brand/5 hover:text-brand text-brand"
                    : "border-stone-200 bg-stone-50 text-stone-300 opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Right Indicator */}
              {canScrollRight && (
                <div className="absolute -right-8 h-12 w-1 rounded-full bg-gradient-to-b from-brand/50 to-brand/0 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Carousel Container with Mobile Navigation */}
        <div className="relative group">
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

          {/* Mobile Navigation Buttons - Below Header, Above Carousel */}
          <div className="md:hidden absolute -top-16 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-10 w-full gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "h-11 w-11 rounded-full border-2 transition-all duration-300 pointer-events-auto flex-shrink-0 font-semibold shadow-xl hover:shadow-2xl active:shadow-md",
                canScrollLeft
                  ? "border-brand/30 bg-gradient-to-br from-brand/20 to-brand/10 hover:from-brand/30 hover:to-brand/20 text-brand hover:scale-110 active:scale-95 backdrop-blur-sm"
                  : "border-stone-200/50 bg-stone-100/40 text-stone-300 opacity-30 cursor-not-allowed backdrop-blur-sm"
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "h-11 w-11 rounded-full border-2 transition-all duration-300 pointer-events-auto flex-shrink-0 font-semibold shadow-xl hover:shadow-2xl active:shadow-md",
                canScrollRight
                  ? "border-brand/30 bg-gradient-to-br from-brand/20 to-brand/10 hover:from-brand/30 hover:to-brand/20 text-brand hover:scale-110 active:scale-95 backdrop-blur-sm"
                  : "border-stone-200/50 bg-stone-100/40 text-stone-300 opacity-30 cursor-not-allowed backdrop-blur-sm"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
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
    <Link
      href={`/product/${product.slug}`}
      className="flex-shrink-0 group"
    >
      <div className="bg-white rounded-2xl overflow-hidden border-2 border-stone-100 shadow-md hover:shadow-2xl transition-all duration-500 w-56 md:w-64 lg:w-72 flex flex-col h-full hover:border-brand hover:scale-105 group-hover:bg-stone-50/50">
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-stone-100 group-hover:opacity-95 transition-opacity duration-300">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            quality={85}
            loading="lazy"
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-brand to-red-700 text-white hover:shadow-lg hover:scale-110 font-bold px-2 py-1 rounded-full shadow-md z-10 transition-all duration-300">
              {product.discount}% OFF
            </Badge>
          )}

          {/* Wishlist Button Overlay */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-125 hover:shadow-xl transition-all z-10 disabled:opacity-50 active:scale-90"
            aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn(
              "w-5 h-5 transition-colors",
              isWishlisted(String(product.id)) ? "fill-brand stroke-brand" : "stroke-stone-600"
            )} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-3">
          {/* Product Name and Pricing */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm md:text-base line-clamp-2 group-hover:text-brand transition-colors mb-2">
              {product.name}
            </h3>

            {/* Pricing */}
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-black text-lg text-stone-900">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-xs text-stone-500 line-through decoration-stone-400/60">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "w-full rounded-xl border-2 border-stone-200 gap-2 h-10 font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 bg-white hover:bg-stone-50 text-stone-900 hover:border-stone-300 hover:shadow-lg",
              !isOutOfStock && "group-hover:bg-brand group-hover:text-white group-hover:border-brand group-hover:shadow-lg"
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
