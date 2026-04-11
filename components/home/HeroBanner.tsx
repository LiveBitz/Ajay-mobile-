"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

import { Banner } from "@prisma/client";

interface HeroBannerProps {
  banners?: Banner[];
}

export function HeroBanner({ banners = [] }: HeroBannerProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (banners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#FFE4EB]">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {banners.map((slide) => (
            <CarouselItem key={slide.id}>
              <Link href={(slide as any).link || "/"} className="block cursor-pointer group">
                <div className="relative h-[300px] md:h-[450px] lg:h-[600px] w-full flex items-center">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-103"
                    priority
                    quality={85}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center px-6 md:px-12 lg:px-20">
                    <div className="max-w-2xl space-y-4 md:space-y-6">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p className="text-sm md:text-base lg:text-lg text-white/90 font-medium max-w-lg">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden lg:block">
          <CarouselPrevious className="left-6 bg-white/20 border-0 text-white hover:bg-white/30 h-12 w-12 rounded-lg" />
          <CarouselNext className="right-6 bg-white/20 border-0 text-white hover:bg-white/30 h-12 w-12 rounded-lg" />
        </div>
      </Carousel>
    </section>
  );
}
