"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HurryUpProductCard } from "./HurryUpProductCard";

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
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight mb-2">
            Limited Time Offers!
          </h2>
          <p className="text-lg md:text-xl font-bold text-zinc-700">
            Save Up to 40% on Premium Phones
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-10 w-10 rounded-full border-orange-200 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="h-5 w-5 text-zinc-700" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-10 w-10 rounded-full border-orange-200 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="h-5 w-5 text-zinc-700" />
          </Button>
        </div>
      </div>
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        onScroll={checkScroll}
        className="flex gap-4 md:gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            className="flex-shrink-0"
            style={{
              width: "clamp(150px, calc(50vw - 100px), 240px)",
              minWidth: "150px",
            }}
          >
            <HurryUpProductCard product={product} />
          </div>
        ))}
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
    </div>
  );
}
