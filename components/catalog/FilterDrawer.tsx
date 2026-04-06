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
import { SlidersHorizontal, X } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { Filters } from "@/hooks/useProductFilter";
import { Badge } from "@/components/ui/badge";
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
          variant="outline"
          className="flex-1 rounded-none border-y py-6 h-auto gap-2 text-zinc-700 font-bold bg-white/50 backdrop-blur-sm relative"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge className="ml-1 bg-brand text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90dvh] rounded-t-[2.5rem] p-0 flex flex-col overflow-hidden border-none shadow-2xl">
        <SheetHeader className="p-6 pb-2 border-b shrink-0 bg-white">
          <div className="w-12 h-1 bg-zinc-100 rounded-full mx-auto mb-6 shrink-0" />
          <SheetTitle className="text-xl font-bold font-heading tracking-tight flex items-center justify-between">
            Refine Results
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="text-brand font-bold text-xs uppercase tracking-widest p-0 h-auto hover:bg-transparent"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Smart Active Selection Row */}
        {hasActiveFilters && (
          <div className="px-6 py-3 bg-zinc-50 border-b shrink-0">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-2 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-400 mr-1 shrink-0">Active:</span>
                {filters.sizes.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-white border-zinc-200 text-zinc-700 gap-1.5 pr-1 pl-2 font-bold py-1 lowercase shadow-sm">
                    {s} <X className="w-3 h-3 cursor-pointer hover:text-brand" onClick={() => removeFilter("sizes", s)} />
                  </Badge>
                ))}
                {filters.colors.map((c) => (
                  <Badge key={c} variant="secondary" className="bg-white border-zinc-200 text-zinc-700 gap-1.5 pr-1 pl-2 font-bold py-1 lowercase shadow-sm">
                    {c} <X className="w-3 h-3 cursor-pointer hover:text-brand" onClick={() => removeFilter("colors", c)} />
                  </Badge>
                ))}
                {filters.subCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="bg-white border-zinc-200 text-zinc-700 gap-1.5 pr-1 pl-2 font-bold py-1 lowercase shadow-sm">
                    {cat} <X className="w-3 h-3 cursor-pointer hover:text-brand" onClick={() => removeFilter("subCategories", cat)} />
                  </Badge>
                ))}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) && (
                  <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-700 gap-1.5 pr-1 pl-2 font-bold py-1 lowercase shadow-sm">
                    ₹{filters.priceRange[0]}-₹{filters.priceRange[1]} <X className="w-3 h-3 cursor-pointer hover:text-brand" onClick={() => removeFilter("priceRange")} />
                  </Badge>
                )}
                {filters.discount > 0 && (
                  <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-700 gap-1.5 pr-1 pl-2 font-bold py-1 lowercase shadow-sm">
                    {filters.discount}%+ <X className="w-3 h-3 cursor-pointer hover:text-brand" onClick={() => removeFilter("discount")} />
                  </Badge>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden bg-white">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            clearAll={clearAll} 
            counts={counts}
            slug={slug}
            className="border-0 shadow-none rounded-none h-full"
          />
        </div>

        <div className="p-6 pt-4 border-t bg-white shrink-0">
          <Button 
            className="w-full h-14 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-lg shadow-xl shadow-zinc-200 transition-all active:scale-[0.98]" 
            onClick={() => setOpen(false)}
          >
            Show Results {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
