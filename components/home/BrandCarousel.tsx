"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const startAuto = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const tick = () => {
      if (!isPausedRef.current) {
        el.scrollLeft += 0.6;
        const oneThird = el.scrollWidth / 3;
        if (el.scrollLeft >= oneThird * 2) {
          el.scrollLeft -= oneThird;
        }
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

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const oneThird = el.scrollWidth / 3;
    if (el.scrollLeft >= oneThird * 2) {
      el.scrollLeft -= oneThird;
    }
    if (el.scrollLeft <= 0) {
      el.scrollLeft += oneThird;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pauseAutoForInteraction();
    if (e.pointerType === "mouse") {
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartScrollLeftRef.current = e.currentTarget.scrollLeft;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, [pauseAutoForInteraction]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.pointerType !== "mouse") return;
    const el = carouselRef.current;
    if (!el) return;
    e.preventDefault();
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

  const handleWheel = useCallback(() => {
    pauseAutoForInteraction();
  }, [pauseAutoForInteraction]);

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth / 3;
    }
    startAuto();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAuto]);

  if (categories.length === 0) return null;
  const items = [...categories, ...categories, ...categories];

  return (
    <section
      className="relative py-10 md:py-14 lg:py-16 overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10">

        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-6 mb-6 md:mb-8">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: "#dc2626" }} />
              <span
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "#dc2626" }}
              >
                Official Stores
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
              style={{ color: "#18181b" }}
            >
              Shop by Brand
            </h2>
            <p className="text-xs md:text-sm font-medium mt-1.5" style={{ color: "#71717a" }}>
              Genuine products · Best prices · Warranty included
            </p>
          </div>
        </div>

        {/* ── Brand Cards Carousel ── */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="carousel-touch-pan flex gap-2.5 sm:gap-3.5 md:gap-4 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
          style={{ userSelect: "none" }}
        >
          {items.map((category, idx) => (
            <BrandCard key={`${category.id}-${idx}`} category={category} />
          ))}
        </div>

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .carousel-touch-pan { touch-action: manipulation; }
      `}</style>
    </section>
  );
}

/* ── Individual Brand Card ── */
function BrandCard({ category }: { category: Category }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex-shrink-0 group"
      style={{ width: "clamp(108px, 11vw, 176px)" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: hovered ? "1px solid #e4e4e7" : "1px solid #f4f4f5",
          boxShadow: hovered
            ? "0 20px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          backgroundColor: hovered ? "#fafafa" : "#ffffff",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >

        {/* ── Logo / Image Area ── */}
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: "1 / 1",
            backgroundColor: hovered ? "#f4f4f5" : "#fafafa",
            transition: "background-color 0.3s ease",
            padding: "14px",
          }}
        >
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: hovered ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.4s ease",
                filter: hovered ? "brightness(1.0)" : "brightness(0.95)",
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span
                className="font-black text-4xl tracking-tighter"
                style={{
                  color: hovered ? "#dc2626" : "#d4d4d8",
                  transition: "color 0.3s ease",
                }}
              >
                {category.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* ── Name Footer ── */}
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{
            borderTop: hovered ? "1px solid #e4e4e7" : "1px solid #f4f4f5",
            transition: "border-color 0.3s ease",
          }}
        >
          <span
            className="font-bold text-sm leading-tight line-clamp-1"
            style={{
              color: hovered ? "#18181b" : "#71717a",
              transition: "color 0.3s ease",
            }}
          >
            {category.name}
          </span>
          <ArrowRight
            className="shrink-0 ml-2"
            style={{
              width: "14px",
              height: "14px",
              color: hovered ? "#dc2626" : "#d4d4d8",
              transform: hovered ? "translateX(2px)" : "translateX(0)",
              transition: "all 0.3s ease",
            }}
          />
        </div>
      </div>
    </Link>
  );
}
