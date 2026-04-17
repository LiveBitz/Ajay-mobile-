"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@prisma/client";

interface BrandCarouselProps {
  categories: Category[];
}

export function BrandCarousel({ categories }: BrandCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateOverflow = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setHasOverflow(el.scrollWidth - el.clientWidth > 6);
  }, []);

  const startAuto = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const tick = () => {
      if (!isPausedRef.current) {
        el.scrollLeft += 0.5;
        const oneThird = el.scrollWidth / 3;
        if (el.scrollLeft >= oneThird * 2) el.scrollLeft -= oneThird;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const pauseAutoForInteraction = useCallback(() => {
    isPausedRef.current = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
      startAuto();
    }, 2000);
  }, [startAuto]);

  const scrollByAmount = useCallback((direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    pauseAutoForInteraction();
    const amount = Math.max(el.clientWidth * 0.6, 200);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, [pauseAutoForInteraction]);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const oneThird = el.scrollWidth / 3;
    if (el.scrollLeft >= oneThird * 2) el.scrollLeft -= oneThird;
    if (el.scrollLeft <= 0) el.scrollLeft += oneThird;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pauseAutoForInteraction();
    if (e.pointerType === "mouse") {
      isDraggingRef.current = true;
      draggedRef.current = false;
      dragStartXRef.current = e.clientX;
      dragStartScrollLeftRef.current = e.currentTarget.scrollLeft;
    }
  }, [pauseAutoForInteraction]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.pointerType !== "mouse") return;
    const el = carouselRef.current;
    if (!el) return;

    const deltaX = e.clientX - dragStartXRef.current;
    
    // Threshold to distinguish between click and drag
    if (!draggedRef.current && Math.abs(deltaX) > 5) {
      draggedRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    if (draggedRef.current) {
      e.preventDefault();
      el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
    }
  }, []);

  const handlePointerUp = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (e?.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleMouseLeave = useCallback(() => { isDraggingRef.current = false; }, []);
  const handleWheel = useCallback(() => { pauseAutoForInteraction(); }, [pauseAutoForInteraction]);

  useEffect(() => {
    const el = carouselRef.current;
    if (el) el.scrollLeft = el.scrollWidth / 3;
    updateOverflow();
    startAuto();
    const onResize = () => updateOverflow();
    el?.addEventListener("scroll", updateOverflow, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      el?.removeEventListener("scroll", updateOverflow);
      window.removeEventListener("resize", onResize);
    };
  }, [categories.length, startAuto, updateOverflow]);

  if (categories.length === 0) return null;
  const items = [...categories, ...categories, ...categories];

  return (
    <section className="relative py-7 md:py-10 lg:py-12 overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-0.5 rounded-full bg-red-600" />
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                Official Stores
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-zinc-900">
              Shop by Brand
            </h2>
            <p className="text-[11px] md:text-xs font-medium mt-1 text-zinc-400">
              Genuine products · Best prices · Warranty included
            </p>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!hasOverflow}
              aria-label="Scroll brands left"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: hasOverflow ? "rgba(255,255,255,0.9)" : "rgba(244,244,245,0.65)",
                border: hasOverflow ? "1px solid rgba(39,39,42,0.14)" : "1px solid rgba(39,39,42,0.08)",
                color: hasOverflow ? "#18181b" : "#a1a1aa",
                boxShadow: hasOverflow ? "0 6px 16px rgba(24,24,27,0.10)" : "none",
                backdropFilter: "blur(8px)",
                cursor: hasOverflow ? "pointer" : "not-allowed",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!hasOverflow}
              aria-label="Scroll brands right"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: hasOverflow ? "rgba(220,38,38,0.93)" : "rgba(220,38,38,0.35)",
                border: hasOverflow ? "1px solid rgba(248,113,113,0.85)" : "1px solid rgba(248,113,113,0.3)",
                color: "#ffffff",
                boxShadow: hasOverflow ? "0 8px 18px rgba(220,38,38,0.25)" : "none",
                cursor: hasOverflow ? "pointer" : "not-allowed",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onClickCapture={handleClickCapture}
          className="brand-carousel"
        >
          {items.map((category, idx) => (
            <BrandCard key={`${category.id}-${idx}`} category={category} />
          ))}
        </div>

      </div>

      <style>{`
        .brand-carousel { display: flex; flex-direction: row; gap: 10px; overflow-x: auto; overflow-y: hidden; padding-bottom: 6px; cursor: grab; user-select: none; -webkit-overflow-scrolling: touch; touch-action: manipulation; scrollbar-width: none; -ms-overflow-style: none; }
        .brand-carousel:active { cursor: grabbing; }
        .brand-carousel::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) { .brand-carousel { gap: 12px; } }
        @media (min-width: 768px) { .brand-carousel { gap: 14px; } }
        @media (min-width: 1024px) { .brand-carousel { gap: 16px; } }
      `}</style>
    </section>
  );
}

/* ── Brand Card ── */
function BrandCard({ category }: { category: Category }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex-shrink-0 group block"
      style={{ width: "clamp(72px, 8.5vw, 130px)" }}
    >
      <div
        className="flex flex-col items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Circle */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "9999px",
            overflow: "hidden",
            border: "1.5px solid #e4e4e7",
            backgroundColor: "#ffffff",
            boxShadow: hovered
              ? "0 8px 20px rgba(0,0,0,0.10)"
              : "0 1px 3px rgba(0,0,0,0.05)",
            transform: hovered ? "translateY(-3px)" : "translateY(0)",
            transition: "all 0.28s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "9999px",
                transform: hovered ? "scale(1.04)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            />
          ) : (
            <span
              style={{
                fontWeight: 900,
                fontSize: "clamp(18px, 3vw, 30px)",
                color: hovered ? "#dc2626" : "#a1a1aa",
                transition: "color 0.28s ease",
                lineHeight: 1,
              }}
            >
              {category.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <span
          style={{
            marginTop: "clamp(6px, 1vw, 10px)",
            fontSize: "clamp(10px, 1.1vw, 13px)",
            fontWeight: 600,
            color: hovered ? "#18181b" : "#52525b",
            textAlign: "center",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.28s ease",
            width: "100%",
          }}
        >
          {category.name}
        </span>
      </div>
    </Link>
  );
}