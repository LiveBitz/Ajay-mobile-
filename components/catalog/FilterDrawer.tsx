"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { Filters } from "@/hooks/useProductFilter";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterDrawerProps {
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
}

export function FilterDrawer({
  filters,
  setFilters,
  clearAll,
  activeFilterCount,
  counts,
  slug,
}: FilterDrawerProps) {
  const [open, setOpen] = React.useState(false);

  const removeFilter = (key: keyof Filters, value?: any) => {
    if (key === "priceRange") {
      setFilters({ ...filters, priceRange: [0, 3000] });
    } else if (key === "discount") {
      setFilters({ ...filters, discount: 0 });
    } else {
      const current = filters[key] as string[];
      setFilters({ ...filters, [key]: current.filter((v) => v !== value) });
    }
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="flex-1 rounded-xl py-4 h-auto text-black font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 flex flex-col items-start gap-1.5 justify-start px-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Filters</span>
          </div>
          <span className="text-base font-bold text-black">{activeFilterCount > 0 ? `${activeFilterCount} active` : "All products"}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85dvh] rounded-t-3xl p-0 flex flex-col overflow-hidden border-none bg-white">
        <SheetHeader className="p-6 pb-3 border-b shrink-0 bg-white">
          <SheetTitle className="text-xl font-bold tracking-tight flex items-center justify-between text-zinc-900">
            Filters
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="text-xs font-semibold text-brand hover:text-brand/80 hover:bg-brand/5 p-2 h-auto rounded-lg"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto bg-white">
          <ScrollArea className="h-full">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              clearAll={clearAll} 
              counts={counts}
              slug={slug}
              className="border-0 shadow-none rounded-none"
            />
          </ScrollArea>
        </div>

        <div className="p-6 pt-4 border-t bg-white shrink-0 flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl border-zinc-200 text-zinc-900 font-semibold hover:bg-zinc-50" 
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl bg-black hover:bg-zinc-900 text-white font-semibold transition-all active:scale-[0.98]" 
            onClick={() => setOpen(false)}
          >
            Show Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
