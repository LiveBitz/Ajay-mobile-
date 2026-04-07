"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  mainImage: string;
  supplementalImages: string[];
  productName: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export function ProductGallery({
  mainImage,
  supplementalImages = [],
  productName,
  isNew,
  isBestSeller,
}: ProductGalleryProps) {
  const allImages = [mainImage, ...(supplementalImages || []).filter(Boolean)].slice(0, 4);
  const [activeImage, setActiveImage] = useState(allImages[0]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
      {/* High-Fidelity Thumbnail Column (Vertical on Desktop) */}
      {allImages.length > 1 && (
        <div className="hidden sm:flex flex-col gap-4 w-20 shrink-0">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setActiveImage(img)}
              className={cn(
                "aspect-[3/4] relative rounded-xl overflow-hidden border-2 transition-all duration-300 active:scale-95 group/thumb",
                activeImage === img 
                  ? "border-zinc-900 shadow-md" 
                  : "border-zinc-50 hover:border-zinc-200 opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${productName} View ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Display Container */}
      <div className="flex-1 space-y-4">
        <div className="aspect-[3/4] sm:aspect-auto sm:h-[600px] lg:h-[700px] max-h-[80vh] relative overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-100 group">
          <Image
            src={activeImage}
            alt={productName}
            fill
            priority
            className="md:object-contain object-cover transition-all duration-700 group-hover:scale-102"
          />

          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2.5 pointer-events-none">
            {isNew && (
              <Badge className="bg-zinc-950 text-white hover:bg-zinc-950 px-4 py-2 rounded-full text-[9px] font-bold tracking-[0.15em] shadow-xl animate-in fade-in slide-in-from-left duration-700">
                NEW ARRIVAL
              </Badge>
            )}
            {isBestSeller && (
              <Badge className="bg-brand text-white hover:bg-brand px-4 py-2 rounded-full text-[9px] font-bold tracking-[0.15em] shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-150">
                BEST SELLER
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex sm:hidden gap-3 overflow-x-auto pb-2 scrollbar-none">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "w-16 h-20 relative rounded-lg overflow-hidden border-2 shrink-0",
                  activeImage === img ? "border-zinc-900" : "border-zinc-100"
                )}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
