"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ProductCard } from "@/components/shared/ProductCard";

interface Props {
  products: any[];
}

export function NewArrivalsCarousel({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getEdgePadding = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.children[0] as HTMLElement;
    if (!card) return 0;
    // padding = half of (track width - card width) so card centers perfectly
    return Math.max(0, (track.clientWidth - card.offsetWidth) / 2);
  }, []);

  const applyTransforms = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    const trackCenter = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let minDist = Infinity;

    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - trackCenter);
      if (dist < minDist) { minDist = dist; closest = i; }

      const ratio = Math.max(-1, Math.min(1, (childCenter - trackCenter) / (track.clientWidth * 0.52)));
      const absRatio = Math.abs(ratio);

      child.style.transform = `perspective(1000px) rotateY(${ratio * 32}deg) scale(${1 - absRatio * 0.15}) translateX(${ratio * -18}px)`;
      child.style.opacity   = String(1 - absRatio * 0.4);
      child.style.filter    = absRatio > 0.1 ? `blur(${absRatio * 1.2}px)` : "none";
      child.style.zIndex    = String(Math.round((1 - absRatio) * 10));
    });

    setActiveIndex(closest);
  }, []);

  const setEdgePadding = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const pad = getEdgePadding();
    track.style.paddingLeft  = `${pad}px`;
    track.style.paddingRight = `${pad}px`;
    // scroll-padding so snap works correctly with the padding
    track.style.scrollPaddingLeft  = `${pad}px`;
    track.style.scrollPaddingRight = `${pad}px`;
  }, [getEdgePadding]);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement;
    if (!child) return;
    // offsetLeft already accounts for padding, center it
    const target = child.offsetLeft - (track.clientWidth - child.offsetWidth) / 2;
    track.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const init = () => {
      setEdgePadding();
      // scroll to first card centered
      const first = track.children[0] as HTMLElement;
      if (first) {
        track.scrollLeft = first.offsetLeft - (track.clientWidth - first.offsetWidth) / 2;
      }
      applyTransforms();
    };

    // rAF ensures layout is done and offsetLeft values are correct
    const raf = requestAnimationFrame(init);

    const onResize = () => {
      setEdgePadding();
      applyTransforms();
    };

    track.addEventListener("scroll", applyTransforms, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", applyTransforms);
      window.removeEventListener("resize", onResize);
    };
  }, [applyTransforms, setEdgePadding]);

  return (
    <div className="na-root">
      <div ref={trackRef} className="na-track">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="na-card"
            onClick={() => { if (i !== activeIndex) scrollToIndex(i); }}
            style={{
              transition:
                "transform 0.38s cubic-bezier(.25,.46,.45,.94), opacity 0.38s ease, filter 0.38s ease",
            }}
          >
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="na-dots">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to product ${i + 1}`}
            className="na-dot"
            data-active={i === activeIndex ? "true" : "false"}
          />
        ))}
      </div>

      <style>{`
        .na-root {
          width: 100%;
          overflow: hidden;
        }

        .na-track {
          display: flex;
          flex-direction: row;
          align-items: center;
          overflow-x: auto;
          overflow-y: visible;
          gap: 12px;
          /* vertical padding gives 3D scale room to breathe */
          padding-top: 20px;
          padding-bottom: 12px;
          /* horizontal padding set dynamically via JS so first/last card centers */
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: manipulation;
          box-sizing: border-box;
        }

        .na-track::-webkit-scrollbar {
          display: none;
        }

        .na-card {
          flex-shrink: 0;
          /* 
            58vw = center card takes up most of screen
            side cards each get ~(100vw - 58vw - gap*2) / 2 ≈ 18vw peeking in
          */
          width: 58vw;
          max-width: 260px;
          scroll-snap-align: center;
          transform-origin: center center;
          will-change: transform, opacity, filter;
          cursor: pointer;
        }

        .na-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 14px;
          padding-bottom: 4px;
        }

        .na-dot {
          height: 6px;
          width: 6px;
          border-radius: 9999px;
          border: none;
          padding: 0;
          cursor: pointer;
          background-color: #d4d4d8;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .na-dot[data-active="true"] {
          width: 22px;
          background-color: #dc2626;
        }
      `}</style>
    </div>
  );
}