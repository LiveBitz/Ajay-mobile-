"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  sortBy: string;
  setSortBy: (value: string) => void;
}

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Discount: High to Low", value: "discount" },
];

export function SortDropdown({ sortBy, setSortBy }: SortDropdownProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex-1 rounded-none border-x-0 border-y py-6 h-auto gap-2 text-zinc-700 font-bold bg-white/50 backdrop-blur-sm">
          <ArrowUpDown className="w-4 h-4" />
          Sort
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] p-0 overflow-hidden">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-center font-bold tracking-tight">Sort By</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
              }}
              className={cn(
                "flex items-center justify-between p-6 text-left border-b last:border-0 transition-colors",
                sortBy === option.value
                  ? "bg-brand text-white"
                  : "bg-white text-zinc-900 group-hover:bg-zinc-50"
              )}
            >
              <span className="font-semibold">{option.label}</span>
              {sortBy === option.value && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
