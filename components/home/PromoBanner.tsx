"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@prisma/client";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

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
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 mb-2 tracking-tight">
            Promotional Offers
          </h2>
          <p className="text-sm md:text-base text-zinc-600 font-medium">
            Check out our latest deals and exclusive promotions
          </p>
        </div>

        {/* Carousel Container */}
        <div
          onMouseEnter={() => pluginRef.current?.stop()}
          onMouseLeave={() => pluginRef.current?.play()}
        >
          <Carousel
            setApi={setApi}
            plugins={[pluginRef.current]}
            className="w-full"
            opts={{ loop: banners.length > 1 }}
          >
            <CarouselContent>
              {banners.map((banner, index) => (
                <CarouselItem key={`promo-${banner.id}`}>
                  <Link href={banner.link || "/"} className="block w-full">
                    {/* ✅ Use aspect-ratio container instead of fill */}
                    <div
                      className="relative w-full rounded-3xl overflow-hidden"
                      style={{ paddingBottom: "35%" }} // ✅ controls height via aspect ratio
                    >
                      <Image
                        src={banner.image}
                        alt={banner.title || "Promotional Banner"}
                        fill
                        className="object-cover md:hover:scale-105 transition-transform duration-700"
                        priority={index === 0}
                        quality={90}
                        sizes="100vw"
                      />
                    </div>
                  </Link>
                </CarouselItem>
              ))}
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
                      ? "0 0 12px rgba(220, 38, 38, 0.4)"
                      : "none",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}