"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

interface BrandCarouselProps {
  categories: Category[];
}

export function BrandCarousel({ categories }: BrandCarouselProps) {
  if (categories.length === 0) return null;

  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(categories.length > 5);

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
      
      setScrollPosition(newPosition);
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header with Navigation */}
        <div className="mb-10 md:mb-12 lg:mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-2">
                Shop Phones by Brands
              </h2>
              <p className="text-stone-600 font-medium">Explore premium brands & latest releases</p>
            </div>

            {/* Navigation Arrows - Desktop/Tablet Only */}
            <div className="hidden md:flex gap-3 items-center relative">
              {/* Left Indicator */}
              {canScrollLeft && (
                <div className="absolute -left-8 h-10 w-1 rounded-full bg-gradient-to-b from-brand/50 to-brand/0 animate-pulse" />
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={cn(
                  "h-10 w-10 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95",
                  canScrollLeft
                    ? "border-brand bg-white shadow-md hover:shadow-lg hover:bg-gradient-to-br hover:from-brand/10 hover:to-brand/5 hover:text-brand text-brand"
                    : "border-stone-200 bg-stone-50 text-stone-300 opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={cn(
                  "h-10 w-10 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95",
                  canScrollRight
                    ? "border-brand bg-white shadow-md hover:shadow-lg hover:bg-gradient-to-br hover:from-brand/10 hover:to-brand/5 hover:text-brand text-brand"
                    : "border-stone-200 bg-stone-50 text-stone-300 opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Right Indicator */}
              {canScrollRight && (
                <div className="absolute -right-8 h-10 w-1 rounded-full bg-gradient-to-b from-brand/50 to-brand/0 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          <div
            ref={carouselRef}
            onScroll={checkScroll}
            className="flex gap-6 md:gap-8 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
            style={{ scrollBehavior: "smooth" }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name.toLowerCase()}`}
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                  {/* Circular Brand Logo Container */}
                  <div className="relative h-28 w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 rounded-3xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50 border-3 border-stone-200 group-hover:border-brand group-hover:shadow-2xl transition-all duration-500 shadow-lg flex items-center justify-center flex-shrink-0 group-hover:opacity-95">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!category.image && (
                      <div className="text-stone-400 text-center px-2">
                        <span className="text-sm md:text-base font-bold">{category.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Brand Name */}
                  <div className="text-center">
                    <p className="text-sm md:text-base lg:text-lg font-bold text-stone-900 group-hover:text-brand transition-colors duration-300 line-clamp-1">
                      {category.name}
                    </p>
                  </div>
                </div>
              </Link>
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

        {/* Bottom Decorative Line */}
        <div className="mt-10 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
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
