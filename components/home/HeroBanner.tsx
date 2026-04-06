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
import { heroSlides } from "@/lib/data";
import Autoplay from "embla-carousel-autoplay";

export function HeroBanner() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="relative w-full overflow-hidden bg-zinc-100">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[250px] md:h-[500px] lg:h-[700px] w-full flex items-center">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={slide.id === 1}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation arrows visible only on larger screens */}
        <div className="hidden lg:block">
          <CarouselPrevious className="left-8 bg-white/20 border-white/20 text-white hover:bg-white hover:text-zinc-950 h-12 w-12" />
          <CarouselNext className="right-8 bg-white/20 border-white/20 text-white hover:bg-white hover:text-zinc-950 h-12 w-12" />
        </div>
      </Carousel>
    </section>
  );
}
