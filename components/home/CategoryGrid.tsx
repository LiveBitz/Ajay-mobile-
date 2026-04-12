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
    <section className="py-6 md:py-12 lg:py-16 bg-gradient-to-b from-white to-stone-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 md:mb-12 lg:mb-14">
          <h2 className="hidden md:block text-3xl md:text-4xl font-black text-stone-900 mb-2">Shop by Category</h2>
          <p className="hidden md:block text-stone-600 font-medium">Explore our premium collection of devices</p>
        </div>

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
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  {/* Category Icon Container */}
                  <div className="relative h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 border-2 border-stone-200 group-hover:border-brand transition-all duration-300 shadow-md group-hover:shadow-xl flex items-center justify-center flex-shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!category.image && (
                      <div className="text-stone-400 text-center px-2">
                        <span className="text-xs md:text-sm font-semibold">
                          {category.name.split(" ")[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Name */}
                  <div className="text-center">
                    <p className="text-xs md:text-sm lg:text-base font-semibold text-stone-900 group-hover:text-brand transition-colors duration-300 line-clamp-2 w-20 md:w-28 lg:w-32">
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
