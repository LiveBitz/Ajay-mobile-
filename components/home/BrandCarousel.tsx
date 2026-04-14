"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

interface BrandCarouselProps {
  categories: Category[];
}

export function BrandCarousel({ categories }: BrandCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(categories.length > 5);

  const checkScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      const progress =
        scrollWidth > clientWidth
          ? (scrollLeft / (scrollWidth - clientWidth)) * 100
          : 0;
      setScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScroll);
      return () => carousel.removeEventListener("scroll", checkScroll);
    }
  }, [checkScroll]);

  if (categories.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollPosition - scrollAmount
            : scrollPosition + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="relative py-10 md:py-14 lg:py-16 overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">

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
          className="carousel-touch-pan flex gap-2.5 sm:gap-3.5 md:gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((category) => (
            <BrandCard key={category.id} category={category} />
          ))}
        </div>

        {/* ── Scroll Progress Bar ── */}
        <div
          className="mt-6 h-px w-full rounded-full overflow-hidden"
          style={{ backgroundColor: "#f4f4f5" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${scrollProgress}%`,
              background: "linear-gradient(90deg, #dc2626, #ef4444)",
            }}
          />
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
      style={{ width: "clamp(116px, 18vw, 168px)" }}
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
