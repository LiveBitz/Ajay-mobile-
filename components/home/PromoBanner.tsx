"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@prisma/client";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles } from "lucide-react";
import { normalizeBannerLink } from "@/lib/banner-link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { type UseEmblaCarouselType } from "embla-carousel-react";

type CarouselApi = UseEmblaCarouselType[1];

interface PromoBannerProps {
  banners?: Banner[] | null;
}

export function PromoBanner({ banners = [] }: PromoBannerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const pluginRef = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  const onDotClick = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api]
  );

  useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full py-10 md:py-16 lg:py-20" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[110px]"
          style={{ backgroundColor: "rgba(220,38,38,0.10)" }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[360px] h-[360px] rounded-full blur-[95px]"
          style={{ backgroundColor: "rgba(153,27,27,0.08)" }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10">
        {/* Section Header */}
        <div className="mb-8 md:mb-12">
          <div className="inline-flex max-w-full items-center gap-2 sm:gap-2.5 bg-brand/15 border border-brand/30 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 mb-3 md:mb-4">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] text-brand whitespace-nowrap">
              Promotional Offers
            </span>
          </div>

          <h2 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-5xl font-black text-white mb-2 tracking-tight leading-[1.02] sm:leading-[0.98]">
            Grab the <span className="text-brand">Best Deals</span>
            <br />
            <span className="text-zinc-400">Limited-Time Promotions</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400 font-medium max-w-[56ch]">
            Check out our latest deals and exclusive promotions
          </p>
          <div className="mt-5 md:mt-6 h-[2px] w-20 sm:w-28 rounded-full bg-gradient-to-r from-brand via-red-400/70 to-transparent" />
        </div>

        {/* Carousel Container */}
        <div
          onMouseEnter={() => banners.length > 1 && pluginRef.current?.stop?.()}
          onMouseLeave={() => banners.length > 1 && pluginRef.current?.reset?.()}
          className="promo-shell rounded-3xl border border-zinc-800/90 bg-zinc-950/60 p-2 md:p-3 backdrop-blur-sm"
        >
          <Carousel
            setApi={setApi}
            plugins={[pluginRef.current]}
            className="promo-carousel w-full"
            opts={{ loop: banners.length > 1, dragFree: false, skipSnaps: false }}
          >
            <CarouselContent className="promo-track m-0 w-full">
              {banners.map((banner, index) => {
                const href = normalizeBannerLink(banner.link);

                return (
                <CarouselItem key={`promo-${banner.id}`} className="promo-slide pl-0 basis-full w-full">
                  <Link href={href} className="block w-full">
                    {/* Keep a reliable fixed media height across devices */}
                    <div
                      className="promo-media relative w-full rounded-3xl overflow-hidden border border-zinc-800"
                    >
                      <Image
                        src={banner.image}
                        alt={banner.title || "Promotional Banner"}
                        fill
                        className="promo-image object-cover md:hover:scale-105 transition-transform duration-700"
                        priority={index === 0}
                        quality={90}
                        sizes="100vw"
                      />
                    </div>
                  </Link>
                </CarouselItem>
              );
              })}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Pagination Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-6 sm:py-8 px-4">
            {scrollSnaps.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => onDotClick(index)}
                className="transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:ring-offset-black"
                style={{
                  width: selectedIndex === index ? "28px" : "10px",
                  height: "10px",
                  backgroundColor:
                    selectedIndex === index
                      ? "rgb(220, 38, 38)"
                      : "rgb(63, 63, 70)",
                  boxShadow:
                    selectedIndex === index
                      ? "0 0 12px rgba(220, 38, 38, 0.4)"
                      : "none",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .promo-shell,
        .promo-carousel,
        .promo-track,
        .promo-slide,
        .promo-media,
        .promo-image {
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .promo-track {
          will-change: transform;
        }

        .promo-slide {
          contain: layout paint;
        }

        .promo-media {
          padding-bottom: 56%;
        }

        @media (min-width: 640px) {
          .promo-media {
            padding-bottom: 48%;
          }
        }

        @media (min-width: 768px) {
          .promo-media {
            padding-bottom: 35%;
          }
        }
      `}</style>
    </section>
  );
}