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
    <section className="py-12 md:py-16 lg:py-20 bg-[#FFE4EB]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
            Shop Phones by Brands
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
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-10 w-10 rounded-full border-zinc-200 hover:border-brand/50 hover:bg-brand/5 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Carousel Container */}
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
              <div className="flex flex-col items-center gap-4">
                {/* Circular Brand Logo Container */}
                <div className="relative h-28 w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 rounded-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 border-2 md:border-3 border-zinc-200 group-hover:border-brand/40 transition-all duration-300 shadow-md group-hover:shadow-xl flex items-center justify-center flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!category.image && (
                    <div className="text-zinc-400 text-center px-2">
                      <span className="text-sm md:text-base font-semibold">{category.name}</span>
                    </div>
                  )}
                </div>

                {/* Brand Name */}
                <div className="text-center">
                  <p className="text-sm md:text-base lg:text-lg font-semibold text-zinc-900 group-hover:text-brand transition-colors duration-300 line-clamp-1">
                    {category.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Decorative Line */}
        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
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
