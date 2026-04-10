import React from "react";
import Image from "next/image";

import { Banner } from "@prisma/client";
import Link from "next/link";

interface PromoBannerProps {
  banner?: Banner | null;
}

export function PromoBanner({ banner }: PromoBannerProps) {
  if (!banner) return null;

  const displayTitle = banner.title;
  const displaySubtitle = banner.subtitle || "";
  const displayImage = banner.image;
  const displayLink = banner.link || "/";

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 lg:px-8 container mx-auto">
      <Link href={displayLink} className="block group">
        <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 text-white min-h-[350px] md:min-h-[450px] flex items-center">
          <Image
            src={displayImage}
            alt="Promotion"
            fill
            className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-103"
          />
          <div className="relative z-10 p-6 md:p-10 lg:p-16 max-w-2xl space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              {displayTitle}
            </h2>
            {displaySubtitle && (
              <p className="text-sm md:text-base text-white/80 font-medium max-w-md">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}
