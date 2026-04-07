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
    <div className="space-y-4">
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
        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
          <FilterChip 
            label={`₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`} 
            onRemove={() => removeFilter("priceRange", [0, 10000])} 
          />
        )}
      </div>
      <button
        onClick={clearAll}
        className="text-xs font-semibold text-brand hover:text-brand/80 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      className="rounded-full bg-zinc-100 text-zinc-900 px-3 py-1 flex items-center gap-2 hover:bg-zinc-200 group transition-all border-0"
    >
      <span className="text-xs font-medium">{label}</span>
      <button 
        onClick={onRemove} 
        className="p-0.5 rounded hover:bg-zinc-300 transition-colors ml-1"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}
