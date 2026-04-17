"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProductFilter, Product } from "@/hooks/useProductFilter";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { MobileFilterBar } from "@/components/catalog/MobileFilterBar";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";

const PAGE_SIZE = 24;

interface CategoryCatalogProps {
  initialProducts: Product[];
  /** All products in category (lightweight fields) — used for sidebar counts */
  facetProducts?: Product[];
  /** Total matching products in DB — drives "Load More" */
  totalCount?: number;
  slug: string;
}

export function CategoryCatalog({
  initialProducts,
  facetProducts,
  totalCount = initialProducts.length,
  slug,
}: CategoryCatalogProps) {
  // ── Filter / sort state (managed by hook; sidebar counts use facetProducts) ──
  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    activeFilterCount,
    counts,
  } = useProductFilter(initialProducts, slug, facetProducts);

  // ── Displayed products (starts with SSR first page; replaced/extended by API) ──
  const [displayProducts, setDisplayProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage]         = useState(1);
  const [serverTotal, setServerTotal]         = useState(totalCount);
  const [isFetching, setIsFetching]           = useState(false);

  // Track whether this is the very first render so we don't fire the
  // filter effect before the user has changed anything.
  const isFirstRender = useRef(true);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const buildQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        slug,
        page: String(page),
        limit: String(PAGE_SIZE),
        sort: sortBy,
        priceMin: String(filters.priceRange[0]),
        priceMax: String(filters.priceRange[1]),
        discount: String(filters.discount),
      });
      if (filters.sizes.length)         params.set("sizes",         filters.sizes.join(","));
      if (filters.colors.length)        params.set("colors",        filters.colors.join(","));
      if (filters.subCategories.length) params.set("subCategories", filters.subCategories.join(","));
      return params.toString();
    },
    [slug, sortBy, filters]
  );

  /** Replace the product grid with page 1 from the API (filter/sort changed). */
  const refetchFromStart = useCallback(async () => {
    const controller = new AbortController();
    setIsFetching(true);
    try {
      const res = await fetch(`/api/products/category?${buildQueryString(1)}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setDisplayProducts(data.products);
      setServerTotal(data.total);
      setCurrentPage(1);
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error("Filter fetch failed", err);
    } finally {
      setIsFetching(false);
    }
    return controller;
  }, [buildQueryString]);

  /** Append the next page to the existing product grid ("Load More"). */
  const loadMore = useCallback(async () => {
    if (isFetching) return;
    const nextPage = currentPage + 1;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/products/category?${buildQueryString(nextPage)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setDisplayProducts((prev) => [...prev, ...data.products]);
      setServerTotal(data.total);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, currentPage, buildQueryString]);

  // ── Re-fetch when filters / sort change (skip the very first render) ──────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    let controller: AbortController | undefined;
    refetchFromStart().then((c) => { controller = c; });
    return () => controller?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy]);

  const clearAll = () => {
    setFilters({ sizes: [], colors: [], priceRange: [0, counts.maxPrice || 10000], discount: 0, subCategories: [] });
    setSortBy("relevance");
  };

  const hasMore = displayProducts.length < serverTotal;

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.subCategories.length > 0 ||
    filters.discount > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < (counts.maxPrice || 10000);

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      {/* Header Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-6">
        <CatalogHeader
          slug={slug}
          count={serverTotal}
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
        productCount={serverTotal}
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
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

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Filters Row */}
            {hasActiveFilters && (
              <div className="mb-6 pb-5 border-b border-zinc-100">
                <ActiveFilters filters={filters} setFilters={setFilters} clearAll={clearAll} />
              </div>
            )}

            {/* Product Grid — loading overlay while fetching */}
            <div className={`relative transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
              {isFetching && (
                <div className="absolute inset-0 flex items-start justify-center pt-24 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
                </div>
              )}
              <ProductGrid products={displayProducts as any} clearFilters={clearAll} />
            </div>

            {/* Load More */}
            {hasMore && !isFetching && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  className="h-11 px-8 rounded-full border border-zinc-200 text-sm font-semibold
                             text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                >
                  Load More ({displayProducts.length} of {serverTotal})
                </button>
              </div>
            )}

            {/* Loading spinner for Load More */}
            {isFetching && currentPage > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
