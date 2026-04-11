"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
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
    <section className="py-12 md:py-16 lg:py-20 bg-[#FFE4EB]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
            Best Selling Phones
          </h2>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="h-10 w-10 rounded-full border-zinc-200 hover:border-brand/50 hover:bg-brand/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-10 w-10 rounded-full border-zinc-200 hover:border-brand/50 hover:bg-brand/5 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5 text-zinc-600" />
            </Button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex-shrink-0 group"
            >
              <div className="bg-white rounded-xl overflow-hidden border border-zinc-200/50 hover:shadow-lg transition-all duration-300 w-56 md:w-64 lg:w-72 flex flex-col h-full">
                {/* Product Image Container */}
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    quality={75}
                    loading="lazy"
                  />

                  {/* Badges - Top Left */}
                  {product.isBestSeller && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold">
                        Best Seller
                      </Badge>
                    </div>
                  )}

                  {/* Wishlist Button - Hover */}
                  <button
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 duration-300"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5 text-zinc-600 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Quick Add Button - Hover */}
                  <button
                    className="absolute bottom-3 left-3 p-2.5 rounded-full bg-zinc-900 text-white shadow-md hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100 duration-300"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                  {/* Product Name */}
                  <h3 className="font-semibold text-zinc-900 text-sm md:text-base line-clamp-2 group-hover:text-brand transition-colors mb-3">
                    {product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg md:text-xl font-bold text-zinc-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-zinc-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
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
