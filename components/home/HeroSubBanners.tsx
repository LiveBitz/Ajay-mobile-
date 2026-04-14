"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@prisma/client";

interface HeroSubBannersProps {
  banners: Banner[];
  startIndex?: number;
  maxItems?: number;
  heading?: string;
  showMobileEdgeFades?: boolean;
  emphasizeMobileCards?: boolean;
}

export function HeroSubBanners({
  banners,
  startIndex = 0,
  maxItems = 2,
  heading = "Featured Hero Banners",
  showMobileEdgeFades = false,
  emphasizeMobileCards = false,
}: HeroSubBannersProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

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
    const el = rowRef.current;
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

  if (!banners || banners.length === 0) return null;

  const displayBanners = banners.slice(startIndex, startIndex + maxItems);
  if (displayBanners.length === 0) return null;
  const cardWidth =
    displayBanners.length >= 3
      ? emphasizeMobileCards
        ? "clamp(260px, 86vw, 700px)"
        : "clamp(240px, 84vw, 640px)"
      : displayBanners.length === 2
      ? "clamp(260px, 84vw, 760px)"
      : "100%";

  const imageAspectRatio = emphasizeMobileCards ? "16 / 6" : "16 / 5.2";

  return (
    <section className="w-full bg-black py-4 md:py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <div className="w-4 h-0.5 rounded-full bg-red-600" />
          <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] font-bold text-zinc-400">
            {heading}
          </p>
        </div>

        <div className="relative">
          <div
            ref={rowRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseLeave={handleMouseLeave}
            className="flex overflow-x-auto gap-3 md:gap-4 lg:gap-5 pb-2 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [touch-action:pan-x] [scroll-behavior:smooth] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
          {displayBanners.map((banner, index) => (
            <Link
              key={banner.id}
              href={(banner.link as string) || "/"}
              className="group relative block shrink-0 snap-start rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors duration-300"
              style={{ width: cardWidth }}
            >
              <div className="relative w-full" style={{ aspectRatio: imageAspectRatio }}>
                <Image
                  src={banner.image}
                  alt={banner.title || `Hero banner ${index + 1}`}
                  fill
                  className="object-cover md:group-hover:scale-[1.02] transition-transform duration-500"
                  priority={index === 0}
                  quality={88}
                  sizes={
                    displayBanners.length >= 3
                      ? "(max-width: 767px) 88vw, (max-width: 1023px) 50vw, 33vw"
                      : displayBanners.length === 2
                      ? "(max-width: 767px) 88vw, 50vw"
                      : "100vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none" />
              </div>
            </Link>
          ))}
          </div>

          {showMobileEdgeFades && displayBanners.length > 1 && (
            <>
              <div className="md:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black to-transparent" />
              <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black to-transparent" />
            </>
          )}
        </div>
      </div>

    </section>
  );
}
