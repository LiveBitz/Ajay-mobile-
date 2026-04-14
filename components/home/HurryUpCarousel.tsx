"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [sliderValue, setSliderValue] = useState(0);

  const updateSlider = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? (el.scrollLeft / max) * 100 : 0;
    setSliderValue(progress);
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = carouselRef.current;
    if (!el) return;
    const next = Number(e.target.value);
    setSliderValue(next);
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (next / 100) * Math.max(max, 0);
  };

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
        ref={carouselRef}
        onScroll={updateSlider}
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

      {/* Always-visible manual slider (monitor-friendly) */}
      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={sliderValue}
          onChange={handleSliderChange}
          className="section-slider w-full"
          aria-label="Scroll Flash Sale products"
        />
      </div>

      <style jsx>{`
        .scrollbar-hide { -ms-overflow-style: auto; scrollbar-width: thin; scrollbar-color: #dc2626 rgba(63,63,70,0.45); }
        .scrollbar-hide::-webkit-scrollbar { display: block; height: 8px; }
        .scrollbar-hide::-webkit-scrollbar-track { background: rgba(63,63,70,0.45); border-radius: 9999px; }
        .scrollbar-hide::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 9999px; }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover { background: #b91c1c; }
        .carousel-touch-pan { touch-action: manipulation; }
        .section-slider {
          appearance: none;
          height: 8px;
          border-radius: 9999px;
          background: rgba(63,63,70,0.45);
          outline: none;
        }
        .section-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #dc2626;
          border: 2px solid #7f1d1d;
          cursor: pointer;
        }
        .section-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #dc2626;
          border: 2px solid #7f1d1d;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
