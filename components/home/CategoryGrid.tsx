"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header — visible on all screen sizes */}
        <div className="mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 mb-1.5 tracking-tight">
            Shop by Brand
          </h2>
          <p className="text-sm md:text-base text-zinc-500 font-medium">
            Explore our premium collection of devices
          </p>
        </div>

        {/* Scrollable carousel */}
        <div
          className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3">
                {/* Category Icon */}
                <div className="relative h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200 group-hover:border-zinc-300 group-hover:shadow-lg transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  {!category.image && (
                    <div className="text-zinc-400 text-center px-2">
                      <span className="text-xs md:text-sm font-semibold">
                        {category.name.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <p className="text-xs md:text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors duration-200 line-clamp-2 text-center w-20 md:w-28 lg:w-32">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
