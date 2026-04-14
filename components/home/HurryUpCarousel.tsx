"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { HurryUpProductCard } from "./HurryUpProductCard";

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
  const countdown = useCountdown(23, 59, 45);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 4);
  }, []);

  const scrollByAmount = useCallback((direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 220);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType !== "mouse") return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = e.currentTarget.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.pointerType !== "mouse") return;
    const el = carouselRef.current;
    if (!el) return;
    const deltaX = e.clientX - dragStartXRef.current;
    el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  }, []);

  const handlePointerUp = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = carouselRef.current;
    if (!el) return;

    const onResize = () => updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", onResize);
    };
  }, [products.length, updateScrollButtons]);

  if (!products || products.length === 0) return null;

  return (
    <div>
      {/* ─── Section Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7 md:mb-9">

        {/* Left: Badge + Title + Subtitle */}
        <div className="flex-1 min-w-0">
          {/* "FLASH SALE" pill badge */}
          <div className="inline-flex items-center gap-1.5 bg-brand/15 border border-brand/30 rounded-full px-3 py-1 mb-4">
            <Zap className="w-3.5 h-3.5 text-brand fill-brand" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
              Flash Sale
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight mb-4">
            Up to{" "}
            <span className="relative inline-block">
              <span className="text-brand">40% OFF</span>
              {/* underline accent */}
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-brand/40 rounded-full" />
            </span>
            <br />
            <span className="text-zinc-400 text-2xl md:text-3xl lg:text-4xl font-bold">
              on Premium Phones
            </span>
          </h2>

          <p className="text-zinc-500 text-xs md:text-sm font-medium">
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

          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: canScrollLeft ? "rgba(39,39,42,0.85)" : "rgba(39,39,42,0.35)",
                border: canScrollLeft ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.08)",
                color: canScrollLeft ? "#fafafa" : "#71717a",
                backdropFilter: "blur(10px)",
                cursor: canScrollLeft ? "pointer" : "not-allowed",
              }}
              aria-label="Scroll flash sale left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: canScrollRight ? "rgba(220,38,38,0.94)" : "rgba(220,38,38,0.35)",
                border: canScrollRight ? "1px solid rgba(248,113,113,0.9)" : "1px solid rgba(248,113,113,0.35)",
                color: "#ffffff",
                boxShadow: canScrollRight ? "0 10px 24px rgba(220,38,38,0.42)" : "none",
                cursor: canScrollRight ? "pointer" : "not-allowed",
              }}
              aria-label="Scroll flash sale right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Carousel ─── */}
      <div
        ref={carouselRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseLeave={handleMouseLeave}
        className="carousel-touch-pan flex gap-2.5 sm:gap-3.5 md:gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            className="flex-shrink-0"
            style={{
              width: "clamp(128px, 12.5vw, 200px)",
              minWidth: "128px"
            }}
          >
            <HurryUpProductCard product={product} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .carousel-touch-pan { touch-action: manipulation; }
      `}</style>
    </div>
  );
}
