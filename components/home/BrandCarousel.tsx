"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(categories.length > 5);

  const checkScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate scroll progress for indicator
      const progress = scrollWidth > clientWidth 
        ? (scrollLeft / (scrollWidth - clientWidth)) * 100 
        : 0;
      setScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScroll);
      return () => carousel.removeEventListener("scroll", checkScroll);
    }
  }, [checkScroll]);

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
    }
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-white via-zinc-50/50 to-zinc-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 md:mb-14 lg:mb-16">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-brand rounded-full" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-brand">Premium Brands</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-950 mb-3 tracking-tight leading-tight">
                Shop by Brand
              </h2>
              <p className="text-base md:text-lg text-zinc-600 font-medium max-w-xl">
                Explore our curated collection of premium brands and latest releases
              </p>
            </div>

            {/* Desktop nav arrows — enhanced design */}
            <div className="hidden md:flex gap-3 items-center flex-shrink-0">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={cn(
                  "h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 backdrop-blur-sm",
                  canScrollLeft
                    ? "border-zinc-200 bg-white/80 hover:bg-white hover:border-brand hover:shadow-lg hover:shadow-brand/20 text-zinc-700 hover:text-brand hover:-translate-y-0.5 active:scale-90"
                    : "border-zinc-100 bg-zinc-50/50 text-zinc-300 cursor-not-allowed opacity-40"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={cn(
                  "h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 backdrop-blur-sm",
                  canScrollRight
                    ? "border-zinc-200 bg-white/80 hover:bg-white hover:border-brand hover:shadow-lg hover:shadow-brand/20 text-zinc-700 hover:text-brand hover:-translate-y-0.5 active:scale-90"
                    : "border-zinc-100 bg-zinc-50/50 text-zinc-300 cursor-not-allowed opacity-40"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scroll progress indicator — subtle bar */}
          <div className="h-0.5 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand to-brand/70 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* Mobile nav — refined design */}
        <div className="md:hidden flex items-center justify-end gap-3 mb-6">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
              "border-2 backdrop-blur-sm",
              canScrollLeft
                ? "border-zinc-200 bg-white/80 hover:bg-white hover:border-brand hover:shadow-lg text-zinc-700 hover:text-brand active:scale-90"
                : "border-zinc-100 bg-zinc-50/50 text-zinc-300 opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
              "border-2 backdrop-blur-sm",
              canScrollRight
                ? "border-zinc-200 bg-white/80 hover:bg-white hover:border-brand hover:shadow-lg text-zinc-700 hover:text-brand active:scale-90"
                : "border-zinc-100 bg-zinc-50/50 text-zinc-300 opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Carousel container with snap behavior */}
        <div
          ref={carouselRef}
          className="flex gap-5 sm:gap-6 md:gap-7 lg:gap-8 overflow-x-auto scroll-smooth scrollbar-hide"
          style={{ 
            scrollBehavior: "smooth",
            scrollSnapType: "x mandatory"
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 group cursor-pointer scroll-snap-align-start"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="flex flex-col items-center gap-4 transition-all duration-300">
                {/* Brand Card — Glassmorphism + Neumorphic */}
                <div 
                  className={cn(
                    "relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32",
                    "rounded-2xl sm:rounded-3xl overflow-hidden",
                    "bg-white/60 backdrop-blur-xl",
                    "border border-white/50 sm:border-white/60",
                    "shadow-sm hover:shadow-2xl transition-all duration-300",
                    "flex items-center justify-center flex-shrink-0",
                    "group-hover:scale-105 group-hover:border-white",
                    "group-hover:shadow-brand/30 group-hover:shadow-2xl group-hover:bg-white/80"
                  )}
                >
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/0 via-transparent to-brand/0 md:group-hover:from-brand/5 md:group-hover:to-brand/5 transition-all duration-300 pointer-events-none" />
                  
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  
                  {!category.image && (
                    <div className="text-center px-4 py-2">
                      <span className="text-xs sm:text-sm font-black text-zinc-700 md:group-hover:text-brand transition-colors duration-300 line-clamp-2">
                        {category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand Name — Enhanced typography */}
                <div className="text-center max-w-[120px] transition-all duration-300">
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 md:group-hover:text-brand transition-colors duration-300 line-clamp-2 tracking-tight">
                    {category.name}
                  </p>
                  <div className="h-0.5 w-0 md:group-hover:w-full bg-gradient-to-r from-transparent via-brand to-transparent rounded-full mx-auto transition-all duration-300 mt-2" />
                </div>

                {/* Focus indicator for accessibility */}
                <div className="absolute inset-0 rounded-3xl ring-2 ring-transparent group-focus-within:ring-brand transition-all opacity-0 group-focus-within:opacity-100 pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>

        {/* Touch scroll hint for mobile */}
        {categories.length > 3 && (
          <div className="md:hidden mt-6 px-4 py-3 bg-zinc-100/50 rounded-xl border border-zinc-200/50 backdrop-blur-sm">
            <p className="text-xs font-medium text-zinc-600 text-center">
              💡 Swipe or tap arrows to explore more brands
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Smooth scroll snap per container */
        .scroll-snap-align-start {
          scroll-snap-align: start;
          scroll-snap-stop: auto;
        }
      `}</style>
    </section>
  );
}
