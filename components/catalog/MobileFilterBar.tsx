"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { FilterSidebar } from "./FilterSidebar";
import { Filters } from "@/hooks/useProductFilter";
import { cn } from "@/lib/utils";

interface MobileFilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearAll: () => void;
  activeFilterCount: number;
  counts: {
    sizes: Record<string, number>;
    colors: Record<string, number>;
    subCategories: Record<string, number>;
  };
  slug?: string;
  sortBy: string;
  setSortBy: (value: string) => void;
  productCount: number;
}

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Best Discount", value: "discount" },
];

export function MobileFilterBar({
  filters,
  setFilters,
  clearAll,
  activeFilterCount,
  counts,
  slug,
  sortBy,
  setSortBy,
  productCount,
}: MobileFilterBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const currentSort = sortOptions.find((o) => o.value === sortBy);

  const handleSortSelect = (value: string) => {
    setSortBy(value);
    setSortOpen(false);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex gap-2 items-center">
        {/* Filter Button */}
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button
              className={cn(
                "flex-1 h-11 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2",
                activeFilterCount > 0
                  ? "bg-black text-white hover:bg-zinc-900"
                  : "bg-zinc-100 text-black hover:bg-zinc-200"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[90dvh] rounded-t-3xl p-0 flex flex-col overflow-hidden border-none bg-white"
          >
            <SheetHeader className="p-6 pb-3 border-b shrink-0 bg-white flex flex-row items-center justify-between space-y-0">
              <SheetTitle className="text-lg font-bold tracking-tight text-zinc-900">
                Filters
              </SheetTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs font-semibold text-brand hover:text-brand/80 hover:bg-brand/5 p-2 h-auto rounded-lg"
                >
                  Clear All
                </Button>
              )}
            </SheetHeader>

            {/* Scrollable filter content - use native scroll without nested ScrollArea */}
            <div className="flex-1 overflow-y-scroll overscroll-contain">
              <div className="px-6 py-5 pb-32 space-y-4">
                {/* Price Range */}
                <section className="space-y-3 pb-4 border-b border-zinc-100">
                  <button 
                    onClick={() => {}}
                    className="flex items-center justify-between w-full"
                  >
                    <h4 className="text-sm font-bold text-zinc-900">Price Range</h4>
                    <span className="text-xs font-medium text-brand">₹{filters.priceRange[0]}-₹{filters.priceRange[1]}</span>
                  </button>
                </section>

                {/* Sizes */}
                <section className="space-y-3 pb-4 border-b border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-900">Size</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(counts.sizes).map(([size, count]) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filters.sizes.includes(size)}
                          onChange={() => {
                            const updated = filters.sizes.includes(size)
                              ? filters.sizes.filter(s => s !== size)
                              : [...filters.sizes, size];
                            setFilters({ ...filters, sizes: updated });
                          }}
                          className="w-4 h-4 rounded border-zinc-300"
                        />
                        <div className="flex-1 text-sm">
                          <div className="font-medium text-zinc-900">{size}</div>
                          <div className="text-xs text-zinc-500">({count} units)</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Colors */}
                <section className="space-y-3 pb-4 border-b border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-900">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(counts.colors).map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          const updated = filters.colors.includes(color)
                            ? filters.colors.filter(c => c !== color)
                            : [...filters.colors, color];
                          setFilters({ ...filters, colors: updated });
                        }}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          filters.colors.includes(color)
                            ? 'border-brand ring-2 ring-brand ring-offset-2'
                            : 'border-zinc-200'
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                </section>

                {/* Discount */}
                <section className="space-y-3 pb-4 border-b border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-900">Discount</h4>
                  <div className="space-y-2">
                    {[10, 20, 30, 40, 50].map((discount) => (
                      <label key={discount} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="discount"
                          checked={filters.discount === discount}
                          onChange={() => setFilters({ ...filters, discount })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium text-zinc-900">{discount}% and above</span>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Categories */}
                <section className="space-y-3 pb-4">
                  <h4 className="text-sm font-bold text-zinc-900">Category</h4>
                  <div className="space-y-2">
                    {Object.entries(counts.subCategories).map(([category, count]) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filters.subCategories.includes(category)}
                          onChange={() => {
                            const updated = filters.subCategories.includes(category)
                              ? filters.subCategories.filter(c => c !== category)
                              : [...filters.subCategories, category];
                            setFilters({ ...filters, subCategories: updated });
                          }}
                          className="w-4 h-4 rounded border-zinc-300"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-900">{category}</span>
                          <span className="text-xs text-zinc-500">({count})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <SheetFooter className="p-4 border-t bg-white shrink-0 gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-lg border-zinc-200 text-zinc-900 font-semibold hover:bg-zinc-50"
                onClick={() => setFilterOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 rounded-lg bg-black hover:bg-zinc-900 text-white font-semibold transition-all active:scale-[0.98]"
                onClick={() => setFilterOpen(false)}
              >
                Show {productCount} Results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Sort Button */}
        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <SheetTrigger asChild>
            <Button
              className="flex-1 h-11 rounded-lg font-medium text-sm transition-all bg-zinc-100 text-black hover:bg-zinc-200 flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden xs:inline">Sort</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl p-0 bg-white border-none"
          >
            <SheetHeader className="px-6 pt-6 pb-3 border-b border-zinc-200">
              <SheetTitle className="text-lg font-bold text-zinc-900">
                Sort Products
              </SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto px-6">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors",
                    sortBy === option.value
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
