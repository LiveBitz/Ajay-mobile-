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

  const visibleProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

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
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-zinc-50">
          <PackageSearch className="w-12 h-12 md:w-16 md:h-16 text-zinc-300 mx-auto" />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-zinc-900">No products found</h3>
          <p className="text-zinc-600 text-sm md:text-base max-w-sm mx-auto">
            Try adjusting your filters to find what you're looking for.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-lg font-semibold text-sm h-10 px-6 border-zinc-200 hover:bg-zinc-50 hover:border-brand/20"
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto min-w-[240px] rounded-lg font-semibold text-sm h-11 border-zinc-200 hover:bg-zinc-50 hover:border-brand/20 transition-all active:scale-95"
            onClick={handleLoadMore}
            disabled={isMoreLoading}
          >
            {isMoreLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              `Load More Products (${products.length - displayCount} remaining)`
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
