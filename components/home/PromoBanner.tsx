import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 container mx-auto">
      <div className="relative w-full overflow-hidden rounded-3xl bg-zinc-950 text-white min-h-[400px] flex items-center group">
        <Image
          src="https://picsum.photos/seed/perf-promo/1400/600"
          alt="Promotion"
          fill
          className="object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="relative z-10 p-8 md:p-16 lg:p-24 max-w-2xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight tracking-tighter">
              FLAT 30% OFF <br />
              <span className="text-brand">ON LUXURY PERFUMES</span>
            </h2>
            <p className="text-zinc-300 text-lg md:text-xl font-medium max-w-md">
              Discover your signature scent with our luxury collection. Limited time offer!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="bg-brand hover:bg-brand/90 text-white px-8 h-14 rounded-full font-bold text-lg shadow-xl shadow-brand/20 transition-all hover:scale-105">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-zinc-950 px-8 h-14 rounded-full font-bold text-lg backdrop-blur-sm transition-all">
              Apply Code: SOULED30
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand/20 to-transparent hidden lg:block" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand/10 blur-3xl rounded-full" />
      </div>
    </section>
  );
}
