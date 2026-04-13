"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PackageSearch, Loader2 } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  clearFilters: () => void;
}

export function ProductGrid({ products, isLoading, clearFilters }: ProductGridProps) {
  const [displayCount, setDisplayCount] = useState(8);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  // Calculate total stock from size variants and filter available products
  const getProductTotalStock = (product: any): number => {
    if (typeof product.sizes === 'string' && product.sizes.includes(':')) {
      // Single size with stock: "S:10"
      return parseInt(product.sizes.split(':')[1]) || 0;
    }
    if (Array.isArray(product.sizes)) {
      // Multiple sizes: ["S:10", "M:15", "L:12"]
      return product.sizes.reduce((total: number, sizeStr: string) => {
        if (typeof sizeStr === "string" && sizeStr.includes(":")) {
          const [_, quantity] = sizeStr.split(":");
          return total + (parseInt(quantity) || 0);
        }
        return total;
      }, 0);
    }
    // Fallback to legacy stock field
    return product.stock || 0;
  };

  const availableProducts = products.filter(p => getProductTotalStock(p) > 0);
  const visibleProducts = availableProducts.slice(0, displayCount);
  const hasMore = displayCount < availableProducts.length;

  const handleLoadMore = () => {
    setIsMoreLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setDisplayCount((prev) => prev + 8);
      setIsMoreLoading(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
          <PackageSearch className="w-7 h-7 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-900">No products found</h3>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">Try adjusting your filters to see more results.</p>
        </div>
        <Button
          onClick={clearFilters}
          className="h-10 px-6 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
        >
          Clear Filters
        </Button>
      </div>
    );
  }

  if (availableProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
          <PackageSearch className="w-7 h-7 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-900">Out of Stock</h3>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">All items matching your criteria are currently out of stock.</p>
        </div>
        <Button
          onClick={clearFilters}
          className="h-10 px-6 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
        >
          View All Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto min-w-[240px] h-12 rounded-xl font-semibold text-sm border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 shadow-sm"
            onClick={handleLoadMore}
            disabled={isMoreLoading}
          >
            {isMoreLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              `Load More (${availableProducts.length - displayCount} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
