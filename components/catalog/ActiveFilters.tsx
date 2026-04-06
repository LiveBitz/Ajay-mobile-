"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Filters } from "@/hooks/useProductFilter";

interface ActiveFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearAll: () => void;
}

export function ActiveFilters({ filters, setFilters, clearAll }: ActiveFiltersProps) {
  const removeFilter = (key: keyof Filters, value: any) => {
    const updatedFilters = { ...filters };
    if (Array.isArray(updatedFilters[key])) {
      (updatedFilters[key] as string[]) = (updatedFilters[key] as string[]).filter(
        (v) => v !== value
      );
    } else if (key === "discount") {
      updatedFilters.discount = 0;
    } else if (key === "priceRange") {
      updatedFilters.priceRange = [0, 3000];
    }
    setFilters(updatedFilters);
  };

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.subCategories.length > 0 ||
    filters.discount > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 3000;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-wrap items-center gap-2">
        {filters.sizes.map((s) => (
          <FilterChip key={`size-${s}`} label={`Size: ${s}`} onRemove={() => removeFilter("sizes", s)} />
        ))}
        {filters.colors.map((c) => (
          <FilterChip key={`color-${c}`} label={`Color: ${c}`} onRemove={() => removeFilter("colors", c)} />
        ))}
        {filters.subCategories.map((sc) => (
          <FilterChip key={`sub-${sc}`} label={sc} onRemove={() => removeFilter("subCategories", sc)} />
        ))}
        {filters.discount > 0 && (
          <FilterChip label={`${filters.discount}%+ Off`} onRemove={() => removeFilter("discount", 0)} />
        )}
        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) && (
          <FilterChip 
            label={`₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`} 
            onRemove={() => removeFilter("priceRange", [0, 3000])} 
          />
        )}
      </div>
      <button
        onClick={clearAll}
        className="text-xs font-bold text-brand hover:underline underline-offset-4 uppercase tracking-widest px-2"
      >
        Clear All
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className="rounded-full bg-white border border-zinc-200 text-zinc-900 px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-50 group hover:border-brand transition-all shadow-sm"
    >
      <span className="text-xs font-semibold">{label}</span>
      <button 
        onClick={onRemove} 
        className="p-0.5 rounded-full hover:bg-brand hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}
