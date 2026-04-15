"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ProductCard } from "@/components/shared/ProductCard";

interface Props {
  products: any[];
}

export function NewArrivalsCarousel({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef<number>(-1);

  const getEdgePadding = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.children[0] as HTMLElement;
    if (!card) return 0;
    return Math.max(0, (track.clientWidth - card.offsetWidth) / 2);
  }, []);

  const applyTransforms = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // Skip if scroll position hasn't changed — prevents unnecessary repaints
    if (track.scrollLeft === lastScrollRef.current) return;
    lastScrollRef.current = track.scrollLeft;

    const children = Array.from(track.children) as HTMLElement[];
    const trackCenter = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let minDist = Infinity;

    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - trackCenter);
      if (dist < minDist) { minDist = dist; closest = i; }

      const ratio = Math.max(-1, Math.min(1,
        (childCenter - trackCenter) / (track.clientWidth * 0.46)
      ));
      const absRatio = Math.abs(ratio);

      const rotateY = ratio * 44;
      const scale   = 1 - absRatio * 0.22;
      const tx      = ratio * -26;
      const opacity = 1 - absRatio * 0.55;
      const blur    = absRatio > 0.08 ? absRatio * 2.5 : 0;

      // Batch all style writes together — no interleaved reads
      child.style.transform = `perspective(1200px) rotateY(${rotateY}deg) scale(${scale}) translateX(${tx}px)`;
      child.style.opacity   = opacity.toFixed(3);
      child.style.filter    = blur > 0 ? `blur(${blur.toFixed(2)}px)` : "none";
      child.style.zIndex    = String(Math.round((1 - absRatio) * 10));
    });

    // Update active card shadow separately to avoid layout thrashing
    children.forEach((child, i) => {
      const inner = child.querySelector(".na-card-inner") as HTMLElement | null;
      if (!inner) return;
      if (i === closest) {
        inner.style.boxShadow = "0 32px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(220,38,38,0.10)";
        inner.style.transform = "translateY(-4px)";
      } else {
        inner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        inner.style.transform = "translateY(0px)";
      }
    });

    setActiveIndex(closest);
  }, []);

  // rAF-throttled scroll handler — only runs once per frame max
  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      applyTransforms();
      rafRef.current = null;
    });
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

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement;
    if (!child) return;
    track.scrollTo({
      left: child.offsetLeft - (track.clientWidth - child.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const init = () => {
      setEdgePadding();
      const first = track.children[0] as HTMLElement;
      if (first) {
        track.scrollLeft = first.offsetLeft - (track.clientWidth - first.offsetWidth) / 2;
      }
      lastScrollRef.current = -1; // force first paint
      applyTransforms();
    };

    const raf = requestAnimationFrame(init);

    const onResize = () => {
      setEdgePadding();
      lastScrollRef.current = -1;
      applyTransforms();
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [applyTransforms, onScroll, setEdgePadding]);

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
          background: radial-gradient(ellipse 90% 70% at 50% 40%, rgba(244,244,245,0.9) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
          z-index: 0;
        }
        .na-track {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          overflow-x: auto;
          overflow-y: visible;
          gap: 14px;
          padding-top: 20px;
          padding-bottom: 28px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: pan-x;
          box-sizing: border-box;
          /* Promote scroll container to its own layer */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .na-track::-webkit-scrollbar { display: none; }
        .na-card {
          flex-shrink: 0;
          width: 50vw;
          max-width: 230px;
          scroll-snap-align: center;
          transform-origin: center center;
          /* 
            Remove will-change from here — it was creating a new stacking
            context on every card and fighting the scroll container's layer.
            GPU promotion happens naturally via the transform in JS.
          */
          cursor: pointer;
          position: relative;
          z-index: 1;
          /* CSS transition only on transform/opacity — no JS transition string needed */
          transition:
            transform 0.46s cubic-bezier(.25,.46,.45,.94),
            opacity   0.46s ease,
            filter    0.36s ease;
        }
        .na-card-inner {
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          transition:
            box-shadow 0.46s ease,
            transform  0.46s cubic-bezier(.25,.46,.45,.94);
          /* Own compositing layer for shadow animation */
          transform: translateZ(0);
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
        .na-counter {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 56px;
        }
        .na-cur {
          font-size: 20px;
          font-weight: 900;
          color: #09090b;
          letter-spacing: -0.05em;
          line-height: 1;
        }
        .na-sep {
          width: 1px;
          height: 16px;
          background: #e4e4e7;
          flex-shrink: 0;
        }
        .na-tot {
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          line-height: 1;
        }
        .na-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex: 1;
        }
        .na-dot {
          height: 5px;
          width: 5px;
          border-radius: 9999px;
          border: none;
          padding: 0;
          cursor: pointer;
          background: #e4e4e7;
          transition: width 0.34s cubic-bezier(.25,.46,.45,.94), background-color 0.34s ease;
        }
        .na-dot[data-active="true"] {
          width: 24px;
          background: #dc2626;
        }
        .na-arrows {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 56px;
          justify-content: flex-end;
        }
        .na-arrow {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e4e4e7;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #52525b;
          transition: all 0.2s ease;
          padding: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .na-arrow:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          box-shadow: none;
        }
        .na-arrow:not(:disabled):active {
          transform: scale(0.92);
          background: #f4f4f5;
        }
        .na-arrow-next:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(220,38,38,0.30);
        }
        .na-arrow-next:not(:disabled):active {
          transform: scale(0.92);
          background: #b91c1c;
          box-shadow: 0 2px 6px rgba(220,38,38,0.25);
        }
      `}</style>
    </div>
  );
}