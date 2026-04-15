"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { HurryUpProductCard } from "./HurryUpProductCard";

interface HurryUpCarouselProps {
  products: any[];
}

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
        className="timer-block-box flex items-center justify-center rounded-lg"
        style={{ backgroundColor: "#1c1c1c", border: "1px solid #3f3f46" }}
      >
        <span className="timer-block-num font-black text-white tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1 font-bold">
        {label}
      </span>
    </div>
  );
}

export function HurryUpCarousel({ products }: HurryUpCarouselProps) {
  const countdown = useCountdown(23, 59, 45);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);
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
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    isDraggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = e.currentTarget.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.pointerType !== "mouse") return;
    const el = carouselRef.current;
    if (!el) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) draggedRef.current = true;
    el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  }, []);

  const handlePointerUp = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (e?.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleMouseLeave = useCallback(() => { isDraggingRef.current = false; }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [products.length, updateScrollButtons]);

  if (!products || products.length === 0) return null;

  return (
    <div>
      {/* ─── Section Header ─── */}
      <div className="hurryup-header">

        {/* Left: Badge + Title */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 bg-red-600/15 border border-red-600/30 rounded-full px-3 py-1 mb-3">
            <Zap className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Flash Sale
            </span>
          </div>

          <h2 className="hurryup-title font-black text-white leading-[0.95] tracking-tight mb-2">
            Up to{" "}
            <span className="relative inline-block">
              <span className="text-red-500">40% OFF</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500/40 rounded-full" />
            </span>
            <br />
            <span className="hurryup-subtitle font-bold text-zinc-400">
              on Premium Phones
            </span>
          </h2>

          <p className="text-zinc-500 text-[11px] md:text-xs font-medium">
            While stock lasts · Limited time only
          </p>
        </div>

        {/* Right: Countdown + Nav */}
        <div className="hurryup-right">
          {/* Timer */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Ends in
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TimerBlock value={countdown.h} label="Hrs" />
              <span className="text-zinc-500 font-black text-lg mb-4">:</span>
              <TimerBlock value={countdown.m} label="Min" />
              <span className="text-zinc-500 font-black text-lg mb-4">:</span>
              <TimerBlock value={countdown.s} label="Sec" />
            </div>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll flash sale left"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: canScrollLeft ? "rgba(39,39,42,0.85)" : "rgba(39,39,42,0.35)",
                border: canScrollLeft ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.08)",
                color: canScrollLeft ? "#fafafa" : "#71717a",
                backdropFilter: "blur(10px)",
                cursor: canScrollLeft ? "pointer" : "not-allowed",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              aria-label="Scroll flash sale right"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: canScrollRight ? "rgba(220,38,38,0.94)" : "rgba(220,38,38,0.35)",
                border: canScrollRight ? "1px solid rgba(248,113,113,0.9)" : "1px solid rgba(248,113,113,0.35)",
                color: "#ffffff",
                boxShadow: canScrollRight ? "0 8px 20px rgba(220,38,38,0.38)" : "none",
                cursor: canScrollRight ? "pointer" : "not-allowed",
              }}
            >
              <ChevronRight size={16} />
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
        className="hurryup-carousel"
      >
        {products.map((product: any) => (
          <div key={product.id} className="hurryup-card-wrap">
            <HurryUpProductCard product={product} />
          </div>
        ))}
      </div>

      <style>{`
        /* ── Header layout ── */
        .hurryup-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        @media (min-width: 1024px) {
          .hurryup-header {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 28px;
          }
        }

        /* Right column: timer + arrows stacked */
        .hurryup-right {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .hurryup-right {
            flex-direction: column;
            align-items: flex-end;
            gap: 16px;
          }
        }

        /* ── Title scaling ── */
        .hurryup-title {
          font-size: clamp(22px, 4.5vw, 52px);
        }
        .hurryup-subtitle {
          font-size: clamp(14px, 2.8vw, 34px);
        }

        /* ── Timer block ── */
        .timer-block-box {
          width: clamp(38px, 5vw, 52px);
          height: clamp(38px, 5vw, 52px);
        }
        .timer-block-num {
          font-size: clamp(15px, 2.2vw, 22px);
        }

        /* ── Carousel ── */
        .hurryup-carousel {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          overflow-y: hidden;
          gap: 10px;
          padding-bottom: 10px;
          scroll-behavior: smooth;
          touch-action: pan-x;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          cursor: grab;
          user-select: none;
        }
        .hurryup-carousel:active {
          cursor: grabbing;
        }
        .hurryup-carousel::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 640px) {
          .hurryup-carousel { gap: 12px; }
        }
        @media (min-width: 768px) {
          .hurryup-carousel { gap: 14px; }
        }
        @media (min-width: 1024px) {
          .hurryup-carousel { gap: 16px; }
        }

        /* ── Card width — fluid across all breakpoints ── */
        .hurryup-card-wrap {
          flex-shrink: 0;
          width: clamp(130px, 13vw, 210px);
        }
      `}</style>
    </div>
  );
}