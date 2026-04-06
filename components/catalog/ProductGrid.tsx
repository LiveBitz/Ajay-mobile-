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
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="p-8 rounded-full bg-zinc-50 flex items-center justify-center">
          <PackageSearch className="w-16 h-16 text-zinc-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-heading">No products found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-full font-bold uppercase tracking-widest text-xs h-12 px-8 border-zinc-200 hover:bg-zinc-50"
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 transition-opacity duration-300">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto min-w-[200px] rounded-full font-bold uppercase tracking-widest text-xs h-14 border-zinc-200 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-95"
            onClick={handleLoadMore}
            disabled={isMoreLoading}
          >
            {isMoreLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-1/4 rounded-full" />
          <Skeleton className="h-6 w-1/4 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}
