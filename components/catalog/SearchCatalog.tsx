"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/data";
import { SearchFilters } from "@/components/search/SearchFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";

interface SearchCatalogProps {
  initialProducts: Product[];
  initialQuery: string;
}

export function SearchCatalog({
  initialProducts,
  initialQuery,
}: SearchCatalogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Apply category/filter logic
      if (activeFilters.includes("budget") && product.price >= 20000) {
        return false;
      }
      if (activeFilters.includes("premium") && product.price < 40000) {
        return false;
      }
      if (
        activeFilters.includes("mid-range") &&
        (product.price < 20000 || product.price >= 40000)
      ) {
        return false;
      }
      if (activeFilters.includes("new") && !product.isNew) {
        return false;
      }
      if (activeFilters.includes("sale") && !product.discount) {
        return false;
      }
      return true;
    });
  }, [activeFilters, initialProducts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search & Filters Header */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-2">
            Search Results
          </h1>
          {searchQuery && (
            <p className="text-stone-600 font-medium">
              Found <span className="text-brand font-bold">{filteredProducts.length}</span> products for "
              <span className="font-semibold">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* Search & Filters Section */}
        <div className="bg-stone-50/50 rounded-2xl p-6 border-2 border-stone-200/50 -mx-4 md:mx-0">
          <SearchFilters
            onSearch={handleSearch}
            onFilterChange={setActiveFilters}
            placeholder={`Search in ${filteredProducts.length} results...`}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-20">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="text-6xl">🔍</div>
              <h2 className="text-2xl font-bold text-stone-900">
                No products found
              </h2>
              <p className="text-stone-600 max-w-md">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-stone-600">
                Showing {filteredProducts.length} of {initialProducts.length} products
              </p>
            </div>
            <ProductGrid
              products={filteredProducts}
              clearFilters={() => setActiveFilters([])}
            />
          </div>
        )}
      </div>
    </div>
  );
}
