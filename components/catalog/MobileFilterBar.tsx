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

  const handleSortSelect = (value: string) => {
    setSortBy(value);
    setSortOpen(false);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-sm safe-area-pb">
      <div className="flex gap-2 items-center px-4 py-3">

        {/* ── FILTER SHEET ── */}
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button
              className={cn(
                "flex-1 h-11 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                activeFilterCount > 0
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              )}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold leading-none">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          {/*
            Key fix: SheetContent must be a flex column with a fixed max height.
            - The header and footer are shrink-0 (never compress).
            - The middle scroll area is flex-1 with overflow-y-auto.
            - No padding-bottom tricks needed — footer is always visible.
          */}
          <SheetContent
            side="bottom"
            className={cn(
              // Fixed height: use dvh so it accounts for mobile browser chrome
              "h-[92dvh] max-h-[92dvh]",
              // Rounded top corners, no default border
              "rounded-t-2xl border-none",
              // Flex column — children stack vertically and fill height
              "flex flex-col",
              // Remove default SheetContent padding so we control it per-section
              "p-0",
              "bg-white"
            )}
          >
            {/* ── HEADER — never scrolls ── */}
            <SheetHeader className="shrink-0 flex flex-row items-center justify-between space-y-0 px-5 py-4 border-b border-zinc-100">
              <SheetTitle className="text-base font-bold tracking-tight text-zinc-900">
                Filters
              </SheetTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-3 rounded-lg"
                >
                  Clear All
                </Button>
              )}
            </SheetHeader>

            {/*
              ── SCROLLABLE BODY ──
              flex-1       → takes all remaining height between header & footer
              min-h-0      → critical! without this, flex children won't shrink
              overflow-y-auto → enables scroll
            */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className="px-5 py-4">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  clearAll={clearAll}
                  counts={counts}
                  slug={slug}
                  className="border-0 shadow-none rounded-none bg-transparent"
                />
              </div>
            </div>

            {/* ── FOOTER — never scrolls ── */}
            <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-zinc-100 bg-white">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl border-zinc-200 text-zinc-800 font-semibold hover:bg-zinc-50 active:scale-[0.97] transition-transform"
                onClick={() => setFilterOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold active:scale-[0.97] transition-transform"
                onClick={() => setFilterOpen(false)}
              >
                Show {productCount} Results
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* ── SORT SHEET ── */}
        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <SheetTrigger asChild>
            <Button
              className="flex-1 h-11 rounded-xl font-semibold text-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all"
            >
              <ArrowUpDown className="w-4 h-4 shrink-0" />
              <span>Sort</span>
              {sortBy !== "relevance" && (
                <span className="ml-1 w-2 h-2 rounded-full bg-black shrink-0" />
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="rounded-t-2xl border-none p-0 bg-white flex flex-col"
          >
            <SheetHeader className="shrink-0 px-5 py-4 border-b border-zinc-100">
              <SheetTitle className="text-base font-bold text-zinc-900">
                Sort By
              </SheetTitle>
            </SheetHeader>

            <div className="overflow-y-auto overscroll-contain px-4 py-3 space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    sortBy === option.value
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:bg-zinc-300"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Bottom padding for safe area on notched phones */}
            <div className="shrink-0 h-safe-bottom pb-2" />
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}