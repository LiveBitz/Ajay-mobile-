"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HurryUpProductCard } from "./HurryUpProductCard";
import { cn } from "@/lib/utils";

interface HurryUpCarouselProps {
  products: any[];
}

export function HurryUpCarousel({ products }: HurryUpCarouselProps) {
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
      const scrollAmount = 300;
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
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 relative z-10 gap-6">
        <div className="flex-1">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-stone-900 tracking-tighter mb-3 drop-shadow-lg leading-tight">
            Flash Sale! 🔥
          </h2>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl font-semibold text-stone-800 drop-shadow-md max-w-2xl">
            Save up to <span className="font-black text-3xl bg-gradient-to-r from-brand via-red-600 to-red-700 bg-clip-text text-transparent">40%</span> on premium phones
            <br className="hidden md:block" />
            <span className="text-stone-700 text-base md:text-lg font-medium">While stock lasts • Limited time only</span>
          </p>
        </div>

        {/* Navigation Arrows - Desktop/Tablet Only */}
        <div className="hidden md:flex gap-3 items-center relative">
          {/* Left Indicator */}
          {canScrollLeft && (
            <div className="absolute -left-8 h-12 w-1 rounded-full bg-gradient-to-b from-stone-900/50 to-stone-900/0 animate-pulse" />
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "h-12 w-12 rounded-full border-2 shadow-md transition-all duration-300 hover:scale-110 active:scale-95",
              canScrollLeft
                ? "border-stone-900/80 bg-white hover:shadow-xl hover:bg-stone-900/10 hover:text-stone-900 text-stone-900"
                : "border-stone-900/40 bg-stone-100 text-stone-300 opacity-40 cursor-not-allowed"
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
                ? "border-stone-900/80 bg-white hover:shadow-xl hover:bg-stone-900/10 hover:text-stone-900 text-stone-900"
                : "border-stone-900/40 bg-stone-100 text-stone-300 opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Right Indicator */}
          {canScrollRight && (
            <div className="absolute -right-8 h-12 w-1 rounded-full bg-gradient-to-b from-stone-900/50 to-stone-900/0 animate-pulse" />
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex gap-5 md:gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product: any) => (
            <div
              key={product.id}
              className="flex-shrink-0 transform transition-all duration-300 hover:translate-y-[-8px]"
              style={{
                width: "clamp(160px, calc(50vw - 100px), 260px)",
                minWidth: "160px",
              }}
            >
              <HurryUpProductCard product={product} />
            </div>
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
                ? "border-stone-800/30 bg-gradient-to-br from-stone-800/20 to-stone-700/10 hover:from-stone-800/30 hover:to-stone-700/20 text-stone-800 hover:scale-110 active:scale-95 backdrop-blur-sm"
                : "border-stone-300/40 bg-stone-200/30 text-stone-300 opacity-30 cursor-not-allowed backdrop-blur-sm"
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
                ? "border-stone-800/30 bg-gradient-to-br from-stone-800/20 to-stone-700/10 hover:from-stone-800/30 hover:to-stone-700/20 text-stone-800 hover:scale-110 active:scale-95 backdrop-blur-sm"
                : "border-stone-300/40 bg-stone-200/30 text-stone-300 opacity-30 cursor-not-allowed backdrop-blur-sm"
            )}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="mt-8 h-1 bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0 rounded-full" />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
