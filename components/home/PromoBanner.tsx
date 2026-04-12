import React from "react";
import Image from "next/image";
import { Banner } from "@prisma/client";
import Link from "next/link";

interface PromoBannerProps {
  banner?: Banner | null;
}

export function PromoBanner({ banner }: PromoBannerProps) {
  if (!banner) return null;

  const displayImage = banner.image;
  const displayLink = banner.link || "/";

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <Link href={displayLink} className="block group">
          <div className="relative w-full overflow-hidden rounded-3xl bg-stone-100 min-h-[350px] md:min-h-[450px] shadow-2xl hover:shadow-2xl transition-all duration-500">
            <Image
              src={displayImage}
              alt="Promotion"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
