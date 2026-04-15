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
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

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
    const el = rowRef.current;
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

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (draggedRef.current) e.preventDefault();
  }, []);

  if (!banners || banners.length === 0) return null;

  const displayBanners = banners.slice(startIndex, startIndex + maxItems);
  if (displayBanners.length === 0) return null;

  const count = displayBanners.length;

  const paddingTop = emphasizeMobileCards ? "37.5%" : "32.5%";

  const desktopCols =
    count >= 3 ? "grid-cols-3" : count === 2 ? "grid-cols-2" : "grid-cols-1";

  const desktopSizes =
    count >= 3 ? "(max-width: 1023px) 33vw, 30vw" : count === 2 ? "50vw" : "100vw";

  return (
    <>
      <section className="w-full bg-black py-4 md:py-6 lg:py-7">
        <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">

          {/* Heading */}
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="w-4 h-0.5 rounded-full bg-red-600" />
            <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] font-bold text-zinc-400">
              {heading}
            </p>
          </div>

          {/* ─── MOBILE: horizontal scroll (hidden on md+) ─── */}
          <div className="relative md:hidden">
            <div
              ref={rowRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onMouseLeave={handleMouseLeave}
              className="hero-sub-scroll"
            >
              {displayBanners.map((banner, index) => (
                <Link
                  key={banner.id}
                  href={banner.link ?? "/"}
                  onClick={handleLinkClick}
                  className="hero-sub-mobile-card group relative block rounded-2xl overflow-hidden border border-zinc-800"
                >
                  <div className="relative w-full" style={{ paddingTop }}>
                    <Image
                      src={banner.image}
                      alt={banner.title || `Hero banner ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      quality={88}
                      sizes="84vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none" />
                  </div>
                </Link>
              ))}
            </div>

            {showMobileEdgeFades && count > 1 && (
              <>
                <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-black to-transparent z-10" />
              </>
            )}
          </div>

          {/* ─── DESKTOP: CSS grid (hidden below md) ─── */}
          <div className={`hidden md:grid ${desktopCols} gap-4 lg:gap-5 w-full`}>
            {displayBanners.map((banner, index) => (
              <Link
                key={banner.id}
                href={banner.link ?? "/"}
                className="group relative block w-full rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors duration-300"
              >
                <div className="relative w-full" style={{ paddingTop }}>
                  <Image
                    src={banner.image}
                    alt={banner.title || `Hero banner ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    priority={index === 0}
                    quality={88}
                    sizes={desktopSizes}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* All mobile scroll logic in plain CSS — no jsx, no Tailwind conflicts */}
      <style>{`
        .hero-sub-scroll {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          overflow-y: hidden;
          gap: 12px;
          padding-bottom: 8px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          cursor: grab;
          user-select: none;
          white-space: nowrap;
        }

        .hero-sub-scroll:active {
          cursor: grabbing;
        }

        .hero-sub-scroll::-webkit-scrollbar {
          display: none;
        }

        .hero-sub-mobile-card {
          display: inline-block;
          flex-shrink: 0;
          width: 84vw;
          max-width: 480px;
          scroll-snap-align: start;
          white-space: normal;
        }
      `}</style>
    </>
  );
}