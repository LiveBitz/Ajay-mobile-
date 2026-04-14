"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock } from "lucide-react";
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


        </div>
      </div>

      {/* ─── Carousel ─── */}
      <div
        className="carousel-touch-pan flex gap-2.5 sm:gap-3.5 md:gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            className="flex-shrink-0"
            style={{
              width: "clamp(132px, calc((100vw - 32px) / 2.35), 240px)",
              minWidth: "132px"
            }}
          >
            <HurryUpProductCard product={product} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .carousel-touch-pan { touch-action: manipulation; }
      `}</style>
    </div>
  );
}
