"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // ⚠️ ALL hooks must be called before any early return (Rules of Hooks)
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const lastScrollLeft = useRef(0);

  const stopAuto = useCallback(() => {
    isPausedRef.current = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    // Resume after 2s of no interaction
    resumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
      startAuto();
    }, 2000);
  }, []);

  const startAuto = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const tick = () => {
      if (!isPausedRef.current && el) {
        el.scrollLeft += 1;
        // Seamless loop: when we've scrolled past the first third, jump back
        const oneThird = el.scrollWidth / 3;
        if (el.scrollLeft >= oneThird * 2) {
          el.scrollLeft -= oneThird;
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    // Start at the middle third so looping works in both directions
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth / 3;
      lastScrollLeft.current = el.scrollLeft;
    }
    startAuto();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAuto]);

  // Detect user scroll (mouse wheel or touch scroll on the element)
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Seamless loop on manual scroll too
    const oneThird = el.scrollWidth / 3;
    if (el.scrollLeft >= oneThird * 2) el.scrollLeft -= oneThird;
    if (el.scrollLeft <= 0) el.scrollLeft += oneThird;

    if (isUserScrollingRef.current) stopAuto();
  }, [stopAuto]);

  const handlePointerDown = useCallback(() => {
    isUserScrollingRef.current = true;
    stopAuto();
  }, [stopAuto]);

  const handlePointerUp = useCallback(() => {
    isUserScrollingRef.current = false;
  }, []);

  const handleTouchStart = useCallback(() => {
    isUserScrollingRef.current = true;
    stopAuto();
  }, [stopAuto]);

  const handleTouchEnd = useCallback(() => {
    isUserScrollingRef.current = false;
  }, []);

  // Early return AFTER all hooks (safe per Rules of Hooks)
  if (!categories || categories.length === 0) return null;

  // Duplicate 3× for seamless infinite scroll loop
  const items = [...categories, ...categories, ...categories];

  return (
    <section
      className="relative overflow-hidden border-b border-zinc-800"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Red glows — same as Flash Sale */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-16 -left-16 w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ backgroundColor: "rgba(220,38,38,0.12)" }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-[250px] h-[250px] rounded-full blur-[80px]"
          style={{ backgroundColor: "rgba(153,27,27,0.10)" }}
        />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
      </div>

      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #0a0a0a, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #0a0a0a, transparent)" }}
      />

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-[5] flex items-center gap-4 md:gap-6 lg:gap-8 overflow-x-auto py-3 md:py-4 lg:py-5 cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "manipulation",
        }}
      >
        {items.map((category, idx) => (
          <Link
            key={`${category.id}-${idx}`}
            href={`/category/${category.slug}`}
            draggable={false}
            className="group flex flex-col items-center gap-2 shrink-0"
            style={{ width: "clamp(64px, 7vw, 96px)" }}
          >
            {/* Icon */}
            <div
              className="relative rounded-xl overflow-hidden border border-zinc-800 group-hover:border-red-500 group-hover:-translate-y-0.5 transition-all duration-200 mx-auto"
              style={{
                width: "clamp(48px, 5vw, 72px)",
                height: "clamp(48px, 5vw, 72px)",
                backgroundColor: "#18181b",
              }}
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    userSelect: "none",
                  }}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: "#27272a" }}
                >
                  <span className="text-base font-black text-zinc-500 group-hover:text-red-500 transition-colors">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "rgba(220,38,38,0.08)" }}
              />
            </div>

            {/* Name */}
            <p className="text-xs font-semibold text-zinc-400 group-hover:text-red-400 transition-colors duration-200 text-center leading-tight w-full line-clamp-1 px-1 select-none">
              {category.name}
            </p>
          </Link>
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
