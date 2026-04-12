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
    <section className="py-12 md:py-16 bg-zinc-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 mb-1.5 tracking-tight">
              Shop by Brand
            </h2>
            <p className="text-sm md:text-base text-zinc-500 font-medium">
              Explore premium brands &amp; latest releases
            </p>
          </div>

          {/* Desktop nav arrows — contained, no overflow */}
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

        {/* Mobile nav — in flow, no absolute hack */}
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
          className="flex gap-6 md:gap-8 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.name.toLowerCase()}`}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3 transition-all duration-300">
                {/* Brand logo */}
                <div className="relative h-24 w-24 md:h-32 md:w-32 lg:h-36 lg:w-36 rounded-2xl overflow-hidden bg-white border border-zinc-200 group-hover:border-zinc-300 group-hover:shadow-md transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  {!category.image && (
                    <div className="text-zinc-400 text-center px-2">
                      <span className="text-sm md:text-base font-bold">{category.name}</span>
                    </div>
                  )}
                </div>

                {/* Brand name */}
                <p className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors duration-200 line-clamp-1">
                  {category.name}
                </p>
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
