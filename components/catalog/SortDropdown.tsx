"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SortDropdownProps {
  sortBy: string;
  setSortBy: (value: string) => void;
}

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Best Discount", value: "discount" },
];

export function SortDropdown({ sortBy, setSortBy }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const currentSort = sortOptions.find(o => o.value === sortBy);

  const handleSortSelect = (value: string) => {
    setSortBy(value);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="flex-1 rounded-xl py-4 h-auto text-black font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 flex flex-col items-start gap-1.5 justify-start px-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Sort</span>
          </div>
          <span className="text-base font-bold text-black">{currentSort?.label || "Relevance"}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 bg-black">
        <SheetHeader className="px-6 pt-6 pb-3 border-b border-slate-800">
          <SheetTitle className="text-xl font-bold text-white">Sort Products</SheetTitle>
        </SheetHeader>
        <div className="py-4 px-6 space-y-2 max-h-[60vh] overflow-y-auto">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                sortBy === option.value
                  ? "bg-white text-black"
                  : "bg-slate-900 text-white border border-slate-700 hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
