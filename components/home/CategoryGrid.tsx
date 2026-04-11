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
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Carousel Container */}
        <div>
          {/* Carousel Content */}
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
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  {/* Category Icon Container */}
                  <div className="relative h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 group-hover:border-brand transition-all duration-300 shadow-sm group-hover:shadow-md flex items-center justify-center flex-shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
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
                  <div className="text-center">
                    <p className="text-xs md:text-sm lg:text-base font-semibold text-zinc-900 group-hover:text-brand transition-colors duration-300 line-clamp-2 w-20 md:w-24 lg:w-28">
                      {category.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
