"use client";

import React from "react";
import { useParams } from "next/navigation";
import { allProducts } from "@/lib/data";
import { useProductFilter } from "@/hooks/useProductFilter";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { FilterDrawer } from "@/components/catalog/FilterDrawer";
import { SortDropdown } from "@/components/catalog/SortDropdown";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredProducts,
    activeFilterCount,
    counts,
  } = useProductFilter(allProducts, slug);

  const clearAll = () => {
    setFilters({
      sizes: [],
      colors: [],
      priceRange: [0, 3000],
      discount: 0,
      subCategories: [],
    });
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 lg:py-12 px-4 md:px-8 lg:px-16 space-y-8">
        {/* Header Section */}
        <CatalogHeader 
          slug={slug} 
          count={filteredProducts.length} 
          sortBy={sortBy} 
          setSortBy={setSortBy} 
        />

        {/* Mobile Filter & Sort Bar (Sticky) */}
        <div className="flex lg:hidden sticky top-[72px] md:top-[84px] z-30 -mx-4 md:-mx-8 border-b bg-white/90 backdrop-blur-md shadow-sm">
          <FilterDrawer 
            filters={filters} 
            setFilters={setFilters} 
            clearAll={clearAll} 
            activeFilterCount={activeFilterCount}
            counts={counts}
            slug={slug}
          />
          <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Filter Sidebar (Sticky) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[102px]">
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
          <div className="flex-1 space-y-8 min-w-0">
            {/* Active Filters Row */}
            <div className="min-h-[40px] flex items-center overflow-x-auto no-scrollbar py-2 -mx-2 px-2 lg:mx-0 lg:px-0">
              <ActiveFilters 
                filters={filters} 
                setFilters={setFilters} 
                clearAll={clearAll} 
              />
            </div>

            {/* Product Grid Section */}
            <ProductGrid 
              products={filteredProducts} 
              clearFilters={clearAll} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
