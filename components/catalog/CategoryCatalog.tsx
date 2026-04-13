"use client";

import React from "react";
import { useProductFilter, Product } from "@/hooks/useProductFilter";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { MobileFilterBar } from "@/components/catalog/MobileFilterBar";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";

interface CategoryCatalogProps {
  initialProducts: Product[];
  slug: string;
}

export function CategoryCatalog({ initialProducts, slug }: CategoryCatalogProps) {
  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredProducts,
    activeFilterCount,
    counts,
  } = useProductFilter(initialProducts as any, slug);

  const clearAll = () => {
    setFilters({
      sizes: [],
      colors: [],
      priceRange: [0, 10000],
      discount: 0,
      subCategories: [],
    });
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      {/* Header Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-6">
        <CatalogHeader
          slug={slug}
          count={filteredProducts.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* Mobile Filter & Sort Bar (Fixed Bottom) */}
      <MobileFilterBar
        filters={filters}
        setFilters={setFilters}
        clearAll={clearAll}
        activeFilterCount={activeFilterCount}
        counts={counts}
        slug={slug}
        sortBy={sortBy}
        setSortBy={setSortBy}
        productCount={filteredProducts.length}
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar (Sticky) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[102px] max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                clearAll={clearAll}
                counts={counts}
                slug={slug}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Active Filters Row */}
            {(filters.sizes.length > 0 || filters.colors.length > 0 || filters.subCategories.length > 0 || filters.discount > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
              <div className="mb-6 pb-5 border-b border-zinc-100">
                <ActiveFilters
                  filters={filters}
                  setFilters={setFilters}
                  clearAll={clearAll}
                />
              </div>
            )}

            {/* Product Grid Section */}
            <ProductGrid
              products={filteredProducts as any}
              clearFilters={clearAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
