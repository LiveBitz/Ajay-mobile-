"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
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
    maxPrice?: number;
  };
  className?: string;
  slug?: string;
  hideHeader?: boolean; // ← NEW: mobile sheet passes true
}

const sizeOrder = [
  "One Size", "50ml", "100ml", "32", "34", "36",
  "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL",
];

const colorMap: Record<string, { hex: string; border?: string }> = {
  White:    { hex: "#FFFFFF", border: "border-zinc-300" },
  Black:    { hex: "#000000" },
  Navy:     { hex: "#000080" },
  Grey:     { hex: "#808080" },
  Gray:     { hex: "#808080" },
  Silver:   { hex: "#C0C0C0", border: "border-zinc-300" },
  Red:      { hex: "#FF0000" },
  Green:    { hex: "#008000" },
  Yellow:   { hex: "#FFFF00", border: "border-yellow-200" },
  Pink:     { hex: "#FFC0CB" },
  Brown:    { hex: "#A52A2A" },
  Beige:    { hex: "#F5F5DC", border: "border-zinc-200" },
  Blue:     { hex: "#2563EB" },
  Purple:   { hex: "#800080" },
  Orange:   { hex: "#FFA500" },
  Lavender: { hex: "#E6E6FA", border: "border-zinc-200" },
  Maroon:   { hex: "#800000" },
  Olive:    { hex: "#808000" },
  Teal:     { hex: "#008080" },
  Charcoal: { hex: "#36454F" },
  Mint:     { hex: "#98FF98", border: "border-green-200" },
  Gold:     { hex: "#FFD700", border: "border-yellow-300" },
  Lake:     { hex: "#4A7C9E" },
};

const discounts = [10, 20, 30, 40, 50];

export function FilterSidebar({
  filters,
  setFilters,
  clearAll,
  counts,
  className,
  slug,
  hideHeader = false,
}: FilterSidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    price: true,
    size: true,
    color: true,
    discount: false,
    category: true,
  });

  const isPerfume = slug === "perfumes";
  const isWatch   = slug === "watches";

  const availableSizes = React.useMemo(() =>
    Object.keys(counts.sizes).sort((a, b) => {
      const ia = sizeOrder.indexOf(a), ib = sizeOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }), [counts.sizes]);

  const availableColors       = React.useMemo(() => Object.keys(counts.colors), [counts.colors]);
  const availableSubCategories = React.useMemo(() => Object.keys(counts.subCategories).sort(), [counts.subCategories]);

  const showSize        = availableSizes.length > 0;
  const showColor       = availableColors.length > 0;
  const showSubCategory = availableSubCategories.length > 0;

  const toggleExpanded = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

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

  // ─── Shared sub-components ───────────────────────────────────────────────

  const SectionHeader = ({
    label,
    sectionKey,
    badge,
  }: {
    label: string;
    sectionKey: string;
    badge?: string | null;
  }) => (
    <button
      onClick={() => toggleExpanded(sectionKey)}
      className="flex items-center justify-between w-full py-1 group"
    >
      <span className="text-sm font-semibold text-zinc-900 tracking-tight">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {!expanded[sectionKey] && badge && (
          <span className="text-xs font-semibold text-zinc-500">{badge}</span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-700",
            expanded[sectionKey] && "rotate-180"
          )}
        />
      </div>
    </button>
  );

  const Section = ({ children }: { children: React.ReactNode }) => (
    <div className="py-4 border-b border-zinc-100 last:border-0">{children}</div>
  );

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col bg-white", className)}>

      {/*
        Desktop-only internal header.
        On mobile the MobileFilterBar's SheetHeader is used instead.
      */}
      {!hideHeader && (
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-bold text-sm tracking-tight text-zinc-900">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs font-semibold text-brand hover:text-brand/80 hover:bg-transparent p-0 h-auto"
          >
            Clear
          </Button>
        </div>
      )}

      {/*
        No ScrollArea here — the parent controls scrolling.
        On desktop: FilterSidebar is inside a scrollable sidebar column.
        On mobile:  MobileFilterBar's sheet body is overflow-y-auto.
      */}
      <div className="px-5 py-2 space-y-1">

        {/* ── Price Range ─────────────────────────────────────── */}
        <Section>
          <SectionHeader
            label="Price Range"
            sectionKey="price"
            badge={`₹${filters.priceRange[0]}–₹${filters.priceRange[1]}`}
          />
          {expanded.price && (
            <div className="mt-4 space-y-4">
              <Slider
                value={filters.priceRange}
                min={0}
                max={counts.maxPrice ?? 10000}
                step={100}
                onValueChange={(val) =>
                  setFilters({ ...filters, priceRange: val as [number, number] })
                }
                className="py-1"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-widest">Min</p>
                  <div className="border border-zinc-200 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 bg-zinc-50">
                    ₹{filters.priceRange[0].toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="mt-4 w-3 h-px bg-zinc-300 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-widest text-right">Max</p>
                  <div className="border border-zinc-200 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 bg-zinc-50 text-right">
                    ₹{filters.priceRange[1].toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── Size / Volume ───────────────────────────────────── */}
        {showSize && (
          <Section>
            <SectionHeader
              label={isPerfume ? "Volume" : "Size"}
              sectionKey="size"
              badge={getSelectionSummary("sizes")}
            />
            {expanded.size && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {availableSizes.map((size) => {
                  const count = counts.sizes[size] ?? 0;
                  if (count === 0) return null;
                  const checked = filters.sizes.includes(size);
                  return (
                    <label
                      key={size}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleArrayFilter("sizes", size)}
                        className="data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 rounded-[4px]"
                      />
                      <span className={cn(
                        "text-sm font-medium flex-1 flex items-center justify-between transition-colors",
                        checked ? "text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"
                      )}>
                        {size}
                        <span className="text-xs text-zinc-400 font-normal">{count}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* ── Color ───────────────────────────────────────────── */}
        {showColor && (
          <Section>
            <SectionHeader
              label="Color"
              sectionKey="color"
              badge={getSelectionSummary("colors")}
            />
            {expanded.color && (
              <div className="mt-3 flex flex-wrap gap-3">
                {availableColors.map((colorName) => {
                  const count   = counts.colors[colorName] ?? 0;
                  const info    = colorMap[colorName] ?? { hex: colorName.toLowerCase() };
                  const checked = filters.colors.includes(colorName);
                  const disabled = count === 0 && !checked;
                  const isLight = ["White", "Yellow", "Beige", "Lavender", "Mint", "Silver", "Gold"].includes(colorName);

                  return (
                    <div key={colorName} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => !disabled && toggleArrayFilter("colors", colorName)}
                        disabled={disabled}
                        title={`${colorName} (${count})`}
                        className={cn(
                          "w-9 h-9 rounded-[10px] border-[1.5px] transition-all duration-150 relative flex items-center justify-center",
                          info.border ?? "border-zinc-200",
                          checked
                            ? "ring-2 ring-offset-2 ring-zinc-900 border-transparent"
                            : "hover:scale-105",
                          disabled && "opacity-25 grayscale cursor-not-allowed"
                        )}
                        style={{ backgroundColor: info.hex }}
                      >
                        {checked && (
                          <Check
                            className={cn("w-3.5 h-3.5 stroke-[2.5]", isLight ? "text-zinc-800" : "text-white")}
                          />
                        )}
                      </button>
                      <span className="text-xs font-medium text-zinc-400 truncate max-w-[40px] text-center leading-tight">
                        {colorName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* ── Discount ────────────────────────────────────────── */}
        <Section>
          <SectionHeader
            label="Discount"
            sectionKey="discount"
            badge={filters.discount > 0 ? `${filters.discount}%+` : null}
          />
          {expanded.discount && (
            <div className="mt-3 space-y-2.5">
              {discounts.map((d) => {
                const checked = filters.discount === d;
                return (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() =>
                        setFilters({ ...filters, discount: checked ? 0 : d })
                      }
                      className="data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 rounded-[4px]"
                    />
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      checked ? "text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"
                    )}>
                      {d}% and above
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Category / Watch Type / Fragrance Type ──────────── */}
        {showSubCategory && (
          <Section>
            <SectionHeader
              label={isWatch ? "Watch Type" : isPerfume ? "Fragrance" : "Category"}
              sectionKey="category"
              badge={getSelectionSummary("subCategories")}
            />
            {expanded.category && (
              <div className="mt-3 space-y-2.5">
                {availableSubCategories.map((sub) => {
                  const count   = counts.subCategories[sub] ?? 0;
                  const checked = filters.subCategories.includes(sub);
                  return (
                    <label key={sub} className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleArrayFilter("subCategories", sub)}
                        className="data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 rounded-[4px]"
                      />
                      <span className={cn(
                        "text-sm font-medium flex-1 flex items-center justify-between transition-colors",
                        checked ? "text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"
                      )}>
                        {sub}
                        <span className="text-xs text-zinc-400 font-normal">({count})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* Bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  );
}