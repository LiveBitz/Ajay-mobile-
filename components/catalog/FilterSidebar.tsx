"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Filters } from "@/hooks/useProductFilter";

interface FilterSidebarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearAll: () => void;
  counts: {
    sizes: Record<string, number>;
    colors: Record<string, number>;
    subCategories: Record<string, number>;
  };
  className?: string;
  slug?: string;
}

const sizes = ["One Size", "50ml", "100ml", "32", "34", "36", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const colors = [
  { name: "White", hex: "#FFFFFF", border: "border-zinc-200" },
  { name: "Black", hex: "#000000" },
  { name: "Navy", hex: "#000080" },
  { name: "Grey", hex: "#808080" },
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#A52A2A" },
];
const discounts = [10, 20, 30, 40];
const subCategoriesList = ["T-Shirts", "Hoodies", "Joggers", "Shirts", "Shorts", "Jackets", "Analog", "Digital", "Chronograph", "EDP", "EDT", "Belts", "Eyewear", "Wallets", "Jewelry"];

export function FilterSidebar({ filters, setFilters, clearAll, counts, className, slug }: FilterSidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    price: true,
    size: true,
    color: true,
    discount: false,
    category: true,
  });

  const isPerfume = slug === "perfumes";
  const isWatch = slug === "watches";
  const isAccessory = slug === "accessories";
  const isMen = slug === "men";

  // Logic for showing sections
  const showSize = isMen || isPerfume || isAccessory; // Accessories might have belt sizes
  const showColor = isMen || isAccessory || isWatch; // Some watches have color variants

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayFilter = (key: "sizes" | "colors" | "subCategories", value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const getSelectionSummary = (key: "sizes" | "colors" | "subCategories") => {
    const selected = filters[key];
    if (selected.length === 0) return null;
    if (selected.length <= 2) return selected.join(", ");
    return `${selected.length} selected`;
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden", className)}>
      <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold font-heading text-lg tracking-tight">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAll}
          className="text-brand font-bold text-xs uppercase tracking-widest hover:text-brand hover:bg-brand/5 p-0 h-auto"
        >
          Clear All
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-2">
          {/* Price Range */}
          <section className="space-y-4 py-4">
            <button 
              onClick={() => toggleExpanded("price")}
              className="flex items-center justify-between w-full group"
            >
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 font-heading">Price Range</h4>
              <div className="flex items-center gap-2">
                {!expanded.price && <span className="text-[10px] font-bold text-brand">₹{filters.priceRange[0]}-₹{filters.priceRange[1]}</span>}
                <ChevronDown className={cn("w-4 h-4 transition-transform text-zinc-400 group-hover:text-zinc-900", expanded.price ? "rotate-180" : "")} />
              </div>
            </button>
            
            {expanded.price && (
              <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Slider
                  value={filters.priceRange}
                  min={0}
                  max={3000}
                  step={100}
                  onValueChange={(val) => setFilters({ ...filters, priceRange: val as [number, number] })}
                  className="py-4"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Min</span>
                    <div className="border rounded-lg p-2 text-sm font-bold">₹{filters.priceRange[0]}</div>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Max</span>
                    <div className="border rounded-lg p-2 text-sm font-bold">₹{filters.priceRange[1]}</div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sizes / Volume */}
          {showSize && (
            <>
              <section className="space-y-4 py-4">
                <button 
                  onClick={() => toggleExpanded("size")}
                  className="flex items-center justify-between w-full group"
                >
                  <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 font-heading">
                    {isPerfume ? "Volume" : "Size"}
                  </h4>
                  <div className="flex items-center gap-2">
                    {!expanded.size && <span className="text-[10px] font-bold text-brand">{getSelectionSummary("sizes")}</span>}
                    <ChevronDown className={cn("w-4 h-4 transition-transform text-zinc-400 group-hover:text-zinc-900", expanded.size ? "rotate-180" : "")} />
                  </div>
                </button>
                
                {expanded.size && (
                  <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 text-sm">
                    {sizes.map((size) => {
                      const count = counts.sizes[size] || 0;
                      if (count === 0 && !filters.sizes.includes(size)) return null;
                      return (
                        <div 
                          key={size} 
                          className="flex items-center space-x-2 group cursor-pointer" 
                          onClick={() => toggleArrayFilter("sizes", size)}
                        >
                          <Checkbox 
                            id={`size-${size}`} 
                            checked={filters.sizes.includes(size)}
                            className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                          />
                          <label htmlFor={`size-${size}`} className="font-semibold text-zinc-700 cursor-pointer group-hover:text-brand transition-colors flex items-center justify-between w-full">
                            {size}
                            <span className="text-[10px] text-muted-foreground ml-1">({count})</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              <Separator className="opacity-50" />
            </>
          )}

          {/* Colors */}
          {showColor && (
            <>
              <section className="space-y-4 py-4">
                <button 
                  onClick={() => toggleExpanded("color")}
                  className="flex items-center justify-between w-full group"
                >
                  <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 font-heading">Color</h4>
                  <div className="flex items-center gap-2">
                    {!expanded.color && <span className="text-[10px] font-bold text-brand">{getSelectionSummary("colors")}</span>}
                    <ChevronDown className={cn("w-4 h-4 transition-transform text-zinc-400 group-hover:text-zinc-900", expanded.color ? "rotate-180" : "")} />
                  </div>
                </button>
                
                {expanded.color && (
                  <div className="flex flex-wrap gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {colors.map((color) => {
                      const count = counts.colors[color.name] || 0;
                      const isDisabled = count === 0 && !filters.colors.includes(color.name);
                      return (
                        <button
                          key={color.name}
                          onClick={() => !isDisabled && toggleArrayFilter("colors", color.name)}
                          title={`${color.name} (${count})`}
                          disabled={isDisabled}
                          className={cn(
                            "w-8 h-8 rounded-full border shadow-sm transition-all relative flex items-center justify-center",
                            color.border || "border-transparent",
                            filters.colors.includes(color.name) ? "ring-2 ring-brand ring-offset-2 scale-110" : "hover:scale-110",
                            isDisabled ? "opacity-20 grayscale cursor-not-allowed pointer-events-none" : "opacity-100"
                          )}
                          style={{ backgroundColor: color.hex }}
                        >
                          {filters.colors.includes(color.name) && (
                            <Check className={cn("w-4 h-4", color.name === "White" ? "text-zinc-950" : "text-white")} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
              <Separator className="opacity-50" />
            </>
          )}

          {/* Discount */}
          <section className="space-y-4 py-4">
            <button 
              onClick={() => toggleExpanded("discount")}
              className="flex items-center justify-between w-full group"
            >
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 font-heading">Discount</h4>
              <div className="flex items-center gap-2">
                {!expanded.discount && filters.discount > 0 && <span className="text-[10px] font-bold text-brand">{filters.discount}%+</span>}
                <ChevronDown className={cn("w-4 h-4 transition-transform text-zinc-400 group-hover:text-zinc-900", expanded.discount ? "rotate-180" : "")} />
              </div>
            </button>
            
            {expanded.discount && (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {discounts.map((discount) => (
                  <div key={discount} className="flex items-center space-x-2 cursor-pointer group" onClick={() => setFilters({ ...filters, discount: filters.discount === discount ? 0 : discount })}>
                    <Checkbox 
                      id={`discount-${discount}`} 
                      checked={filters.discount === discount}
                      className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                    />
                    <label htmlFor={`discount-${discount}`} className="font-semibold text-zinc-700 cursor-pointer group-hover:text-brand transition-colors text-sm">
                      {discount}% and above
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator className="opacity-50" />

          {/* Categories / Watch Type */}
          <section className="space-y-4 py-4 pb-8">
            <button 
              onClick={() => toggleExpanded("category")}
              className="flex items-center justify-between w-full group"
            >
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 font-heading">
                {isWatch ? "Watch Type" : (isPerfume ? "Fragrance Type" : "Category")}
              </h4>
              <div className="flex items-center gap-2">
                {!expanded.category && <span className="text-[10px] font-bold text-brand">{getSelectionSummary("subCategories")}</span>}
                <ChevronDown className={cn("w-4 h-4 transition-transform text-zinc-400 group-hover:text-zinc-900", expanded.category ? "rotate-180" : "")} />
              </div>
            </button>
            
            {expanded.category && (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {subCategoriesList
                  .filter((sub) => (counts.subCategories[sub] || 0) > 0)
                  .map((sub) => {
                    const count = counts.subCategories[sub] || 0;
                    return (
                      <div 
                        key={sub} 
                        className="flex items-center space-x-2 cursor-pointer group" 
                        onClick={() => toggleArrayFilter("subCategories", sub)}
                      >
                        <Checkbox 
                          id={`sub-${sub}`} 
                          checked={filters.subCategories.includes(sub)}
                          className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        />
                        <label htmlFor={`sub-${sub}`} className="font-semibold text-zinc-700 cursor-pointer group-hover:text-brand transition-colors text-sm flex items-center justify-between w-full">
                          {sub}
                          <span className="text-[10px] text-muted-foreground ml-1">({count})</span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
