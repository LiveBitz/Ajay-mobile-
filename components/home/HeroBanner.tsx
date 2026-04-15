"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Banner } from "@prisma/client";
import { getBannerLinkTag, normalizeBannerLink } from "@/lib/banner-link";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

type CarouselApi = UseEmblaCarouselType[1];

interface HeroBannerProps {
  banners?: Banner[];
}

export function HeroBanner({ banners = [] }: HeroBannerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const pluginRef = useRef<ReturnType<typeof Autoplay> | null>(null);

  // All hooks must be called unconditionally — no early returns before this point
  if (!pluginRef.current) {
    pluginRef.current = Autoplay({ delay: 5000, stopOnInteraction: false });
  }

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
  }, [api, onSelect]);

  // Conditional render after all hooks
  if (!Array.isArray(banners) || banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-black">
      {/* Hero Carousel */}
      <div
        className="w-full overflow-hidden relative"
        onMouseEnter={() => pluginRef.current?.stop?.()}
        onMouseLeave={() => pluginRef.current?.reset?.()}
      >
        <Carousel
          setApi={setApi}
          plugins={[pluginRef.current]}
          className="w-full"
          opts={{ loop: true }}
        >
          <CarouselContent className="m-0 w-full">
            {banners.map((slide) => {
              const href = normalizeBannerLink(slide.link);
              const linkTag = getBannerLinkTag(slide.link);

              return (
              <CarouselItem key={slide.id} className="pl-0 basis-full w-full">
                <Link href={href} className="block w-full">
                  <div className="hero-banner-media relative w-full bg-zinc-900">
                    <span className="absolute left-3 top-3 z-20 inline-flex h-7 items-center rounded-full border border-white/30 bg-black/55 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm pointer-events-none">
                      {linkTag}
                    </span>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority
                      quality={85}
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
      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-black">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              className="transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
              style={{
                width: selectedIndex === index ? "28px" : "10px",
                height: "10px",
                backgroundColor:
                  selectedIndex === index
                    ? "rgb(220, 38, 38)"
                    : "rgb(229, 231, 235)",
                boxShadow:
                  selectedIndex === index
                    ? "0 2px 8px rgba(220, 38, 38, 0.3)"
                    : "none",
              }}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : "false"}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .hero-banner-media {
          aspect-ratio: 16 / 6;
        }

        @media (min-width: 1024px) {
          .hero-banner-media {
            aspect-ratio: 16 / 4.7;
          }
        }
      `}</style>
    </section>
  );
}
