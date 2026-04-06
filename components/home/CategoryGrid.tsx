import React from "react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function CategoryGrid() {
  return (
    <section id="categories" className="py-14 px-4 md:px-8 lg:px-16 container mx-auto">
      <SectionHeading 
        title="Shop by Category" 
        subtitle="Explore our curated collections for every style and occasion." 
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.name.toLowerCase()}`}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 md:p-6 transition-all duration-300 group-hover:from-brand/90 group-hover:via-brand/30">
              <div className="w-full flex flex-col gap-1 transform transition-transform duration-300 group-hover:-translate-y-2">
                <span className="text-white text-lg md:text-xl font-bold tracking-tight uppercase font-heading">
                  {category.name}
                </span>
                <span className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Shop Now →
                </span>
              </div>
            </div>
            {/* Subtle border overlay on hover */}
            <div className="absolute inset-0 border-0 border-white/20 transition-all duration-300 group-hover:border-8 rounded-2xl" />
          </Link>
        ))}
      </div>
    </section>
  );
}
