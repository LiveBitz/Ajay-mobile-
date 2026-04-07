import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Category } from "@prisma/client";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-16 md:py-20 px-4 md:px-6 lg:px-8 container mx-auto">
      <SectionHeading 
        title="Shop by Category" 
        subtitle="Explore our curated collections for every style and occasion." 
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.name.toLowerCase()}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200 transition-all duration-300 hover:border-brand/30 hover:shadow-lg"
          >
            {category.image && (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4 md:p-5">
              <div className="space-y-1">
                <h3 className="text-white text-base md:text-lg font-bold tracking-tight">
                  {category.name}
                </h3>
                <p className="text-white/60 text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop Collection
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
