"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HurryUpProductCard } from "./HurryUpProductCard";
import { cn } from "@/lib/utils";

interface HurryUpCarouselProps {
  products: any[];
}

// Countdown timer — ends 24 hours from page load
function useCountdown(hours = 23, minutes = 59, seconds = 45) {
  const [time, setTime] = useState({ h: hours, m: minutes, s: seconds });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function TimerBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center"
        style={{ backgroundColor: "#1c1c1c", border: "1px solid #3f3f46" }}
      >
        <span className="text-xl md:text-2xl font-black text-white tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1.5 font-bold">
        {label}
      </span>
    </div>
  );
}

export function HurryUpCarousel({ products }: HurryUpCarouselProps) {
  if (!products || products.length === 0) return null;

  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(products.length > 4);
  const countdown = useCountdown(23, 59, 45);

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
      carouselRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div>
      {/* ─── Section Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 md:mb-12">

        {/* Left: Badge + Title + Subtitle */}
        <div className="flex-1 min-w-0">
          {/* "FLASH SALE" pill badge */}
          <div className="inline-flex items-center gap-1.5 bg-brand/15 border border-brand/30 rounded-full px-3 py-1 mb-5">
            <Zap className="w-3.5 h-3.5 text-brand fill-brand" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
              Flash Sale
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight mb-5">
            Up to{" "}
            <span className="relative inline-block">
              <span className="text-brand">40% OFF</span>
              {/* underline accent */}
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-brand/40 rounded-full" />
            </span>
            <br />
            <span className="text-zinc-400 text-3xl md:text-4xl lg:text-5xl font-bold">
              on Premium Phones
            </span>
          </h2>

          <p className="text-zinc-500 text-sm md:text-base font-medium">
            While stock lasts · Limited time only
          </p>
        </div>

        {/* Right: Countdown + Nav arrows */}
        <div className="flex flex-col items-start lg:items-end gap-6 shrink-0">
          {/* Countdown timer */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Ends in
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TimerBlock value={countdown.h} label="Hrs" />
              <span className="text-zinc-500 font-black text-xl mb-4">:</span>
              <TimerBlock value={countdown.m} label="Min" />
              <span className="text-zinc-500 font-black text-xl mb-4">:</span>
              <TimerBlock value={countdown.s} label="Sec" />
            </div>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden md:flex gap-2 items-center">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-200",
                canScrollLeft
                  ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-700 opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-200",
                canScrollRight
                  ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-700 opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-end gap-2 mb-5">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={cn(
            "h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200",
            canScrollLeft
              ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
              : "border-zinc-800 bg-zinc-900/50 text-zinc-700 opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={cn(
            "h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200",
            canScrollRight
              ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
              : "border-zinc-800 bg-zinc-900/50 text-zinc-700 opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ─── Carousel ─── */}
      <div
        ref={carouselRef}
        onScroll={checkScroll}
        className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            className="flex-shrink-0"
            style={{
              width: "clamp(150px, calc(100vw - 40px) / 2.2, 220px)",
              minWidth: "150px"
            }}
          >
            <HurryUpProductCard product={product} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
