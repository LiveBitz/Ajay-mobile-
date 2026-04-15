"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ProductCard } from "@/components/shared/ProductCard";

interface Props {
  products: any[];
}

export function NewArrivalsCarousel({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef<number>(-1);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isProgrammaticRef = useRef(false);

  const getEdgePadding = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.children[0] as HTMLElement;
    if (!card) return 0;
    return Math.max(0, (track.clientWidth - card.offsetWidth) / 2);
  }, []);

  const applyTransforms = useCallback((force = false) => {
    const track = trackRef.current;
    if (!track) return;
    if (!force && track.scrollLeft === lastScrollRef.current) return;
    lastScrollRef.current = track.scrollLeft;

    const children = Array.from(track.children) as HTMLElement[];
    const trackCenter = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let minDist = Infinity;

    // Pass 1: reads only
    const metrics = children.map((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - trackCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
      const ratio = Math.max(-1, Math.min(1,
        (childCenter - trackCenter) / (track.clientWidth * 0.46)
      ));
      return { ratio, absRatio: Math.abs(ratio) };
    });

    // Pass 2: writes only
    metrics.forEach(({ ratio, absRatio }, i) => {
      const child = children[i];
      const isActive = i === closest;
      const rotateY = ratio * 42;
      const scale   = 1 - absRatio * 0.2;
      const tx      = ratio * -24;
      const opacity = Math.max(0.38, 1 - absRatio * 0.50);

      child.style.transform = `perspective(1100px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)}) translateX(${tx.toFixed(2)}px) translateZ(0)`;
      child.style.opacity   = opacity.toFixed(3);
      child.style.zIndex    = String(isActive ? 10 : Math.round((1 - absRatio) * 9));

      const inner = child.querySelector(".na-card-inner") as HTMLElement | null;
      if (inner) {
        inner.style.boxShadow = isActive
          ? "0 28px 56px rgba(0,0,0,0.13), 0 8px 20px rgba(220,38,38,0.09)"
          : "0 2px 8px rgba(0,0,0,0.05)";
        inner.style.transform = isActive
          ? "translateY(-4px) translateZ(0)"
          : "translateY(0) translateZ(0)";
      }
    });

    if (closest !== activeIndexRef.current) {
      activeIndexRef.current = closest;
      setActiveIndex(closest);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      applyTransforms();
      rafRef.current = null;
    });
  }, [applyTransforms]);

  // Single scroll function used by BOTH arrows and touch swipe
  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement;
    if (!child) return;
    isProgrammaticRef.current = true;
    track.scrollTo({
      left: child.offsetLeft - (track.clientWidth - child.offsetWidth) / 2,
      behavior: "smooth",
    });
    // scrollTo fires scroll events continuously — applyTransforms runs on each one
    // Mark as settled once scroll animation finishes (~400ms)
    setTimeout(() => {
      isProgrammaticRef.current = false;
      lastScrollRef.current = -1;
      applyTransforms(true);
    }, 420);
  }, [applyTransforms]);

  const setEdgePadding = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const pad = getEdgePadding();
    track.style.paddingLeft        = `${pad}px`;
    track.style.paddingRight       = `${pad}px`;
    track.style.scrollPaddingLeft  = `${pad}px`;
    track.style.scrollPaddingRight = `${pad}px`;
  }, [getEdgePadding]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Pre-promote all cards to GPU layers
    Array.from(track.children).forEach((child) => {
      const el = child as HTMLElement;
      el.style.transform  = "perspective(1100px) rotateY(0deg) scale(1) translateX(0px) translateZ(0)";
      el.style.opacity    = "1";
      el.style.willChange = "transform, opacity";
    });

    const init = () => {
      setEdgePadding();
      const first = track.children[0] as HTMLElement;
      if (first) {
        track.scrollLeft = first.offsetLeft - (track.clientWidth - first.offsetWidth) / 2;
      }
      lastScrollRef.current = -1;
      applyTransforms(true);
    };
    requestAnimationFrame(() => { requestAnimationFrame(init); });

    // Touch: record start position only
    const onTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    // Touch: on lift, decide direction and call scrollToIndex — same as arrow buttons
    const onTouchEnd = (e: TouchEvent) => {
      const dx = touchStartXRef.current - e.changedTouches[0].clientX;
      const dy = touchStartYRef.current - e.changedTouches[0].clientY;

      // Ignore if mostly vertical scroll
      if (Math.abs(dy) > Math.abs(dx)) return;

      // Only trigger if swipe is meaningful (>40px)
      if (Math.abs(dx) < 40) return;

      const current = activeIndexRef.current;
      const target = dx > 0
        ? Math.min(products.length - 1, current + 1)
        : Math.max(0, current - 1);

      if (target !== current) {
        scrollToIndex(target);
      }
    };

    // Prevent default touch scroll — we handle scrolling via scrollToIndex
    const onTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(touchStartXRef.current - e.touches[0].clientX);
      const dy = Math.abs(touchStartYRef.current - e.touches[0].clientY);
      if (dx > dy) e.preventDefault();
    };

    const onResize = () => {
      setEdgePadding();
      lastScrollRef.current = -1;
      applyTransforms(true);
    };

    track.addEventListener("scroll",     onScroll,     { passive: true });
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove",  onTouchMove,  { passive: false }); // non-passive to allow preventDefault
    track.addEventListener("touchend",   onTouchEnd,   { passive: true });
    window.addEventListener("resize",    onResize);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      track.removeEventListener("scroll",     onScroll);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove",  onTouchMove);
      track.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("resize",    onResize);
    };
  }, [applyTransforms, onScroll, products.length, scrollToIndex, setEdgePadding]);

  return (
    <div className="na-root">
      <div className="na-bg" />

      <div ref={trackRef} className="na-track">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="na-card"
            onClick={() => { if (i !== activeIndex) scrollToIndex(i); }}
          >
            <div className="na-card-inner">
              <ProductCard product={product as any} />
            </div>
          </div>
        ))}
      </div>

      <div className="na-controls">
        <div className="na-counter">
          <span className="na-cur">{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="na-sep" />
          <span className="na-tot">{String(products.length).padStart(2, "0")}</span>
        </div>
        <div className="na-dots">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Product ${i + 1}`}
              className="na-dot"
              data-active={i === activeIndex ? "true" : "false"}
            />
          ))}
        </div>
        <div className="na-arrows">
          <button
            className="na-arrow"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M8.5 2L4 6.5L8.5 11" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="na-arrow na-arrow-next"
            onClick={() => scrollToIndex(Math.min(products.length - 1, activeIndex + 1))}
            disabled={activeIndex === products.length - 1}
            aria-label="Next"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M4.5 2L9 6.5L4.5 11" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .na-root {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          padding-bottom: 20px;
        }
        .na-bg {
          position: absolute;
          left: 0; right: 0; top: 0; bottom: 60px;
          background: radial-gradient(
            ellipse 90% 70% at 50% 40%,
            rgba(244,244,245,0.9) 0%,
            rgba(255,255,255,0) 100%
          );
          pointer-events: none;
          z-index: 0;
        }
        .na-track {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          overflow-x: auto;
          overflow-y: visible;
          gap: 14px;
          padding-top: 20px;
          padding-bottom: 28px;
          /* No scroll-snap — scrollToIndex handles all snapping */
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          /* touch-action managed by touchmove preventDefault */
          box-sizing: border-box;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .na-track::-webkit-scrollbar { display: none; }

        .na-card {
          flex-shrink: 0;
          width: 50vw;
          max-width: 230px;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .na-card-inner {
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          transition:
            box-shadow 0.4s ease,
            transform  0.4s cubic-bezier(.25,.46,.45,.94);
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .na-controls {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          gap: 10px;
        }
        .na-counter { display: flex; align-items: center; gap: 7px; min-width: 56px; }
        .na-cur {
          font-size: 20px; font-weight: 900; color: #09090b;
          letter-spacing: -0.05em; line-height: 1;
        }
        .na-sep { width: 1px; height: 16px; background: #e4e4e7; flex-shrink: 0; }
        .na-tot { font-size: 13px; font-weight: 500; color: #a1a1aa; line-height: 1; }
        .na-dots {
          display: flex; align-items: center;
          justify-content: center; gap: 5px; flex: 1;
        }
        .na-dot {
          height: 5px; width: 5px; border-radius: 9999px;
          border: none; padding: 0; cursor: pointer; background: #e4e4e7;
          transition:
            width 0.3s cubic-bezier(.25,.46,.45,.94),
            background-color 0.3s ease;
        }
        .na-dot[data-active="true"] { width: 24px; background: #dc2626; }
        .na-arrows {
          display: flex; align-items: center;
          gap: 7px; min-width: 56px; justify-content: flex-end;
        }
        .na-arrow {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid #e4e4e7; background: #ffffff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #52525b;
          transition: all 0.18s ease; padding: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .na-arrow:disabled { opacity: 0.25; cursor: not-allowed; box-shadow: none; }
        .na-arrow:not(:disabled):active { transform: scale(0.92); background: #f4f4f5; }
        .na-arrow-next:not(:disabled) {
          background: #dc2626; border-color: #dc2626; color: #ffffff;
          box-shadow: 0 4px 12px rgba(220,38,38,0.28);
        }
        .na-arrow-next:not(:disabled):active {
          transform: scale(0.92); background: #b91c1c;
        }
      `}</style>
    </div>
  );
}