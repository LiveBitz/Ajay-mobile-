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
    <section className="bg-black border-b border-zinc-800">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div
          className="flex items-center justify-between overflow-x-auto scrollbar-hide py-3 md:py-4 lg:py-5 gap-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex-1 min-w-[60px] max-w-[100px] group flex flex-col items-center gap-2"
            >
              {/* Icon — fixed px size per breakpoint via inline style */}
              <div
                className="relative rounded-xl lg:rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-500 group-hover:shadow-md group-hover:shadow-red-500/20 group-hover:-translate-y-0.5 transition-all duration-200 mx-auto shrink-0"
                style={{
                  width: "clamp(48px, 5vw, 80px)",
                  height: "clamp(48px, 5vw, 80px)",
                }}
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{ width: "100%", height: "100%" }}
                    className="flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors"
                  >
                    <span className="text-lg font-black text-zinc-500 group-hover:text-red-500 transition-colors">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-200" />
              </div>

              {/* Name */}
              <p className="text-[10px] md:text-[11px] lg:text-xs font-semibold text-white group-hover:text-red-400 transition-colors duration-200 text-center leading-tight w-full line-clamp-1 px-1">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}