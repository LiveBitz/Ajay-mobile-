import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 lg:py-12 px-4 md:px-8 lg:px-16 space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-4 border-b border-zinc-100">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <Skeleton className="h-10 w-48 rounded-full hidden md:block" />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Skeleton (Desktop only) */}
        <div className="hidden lg:block w-72 shrink-0 space-y-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <Skeleton className="h-4 w-4/6 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="flex-1 space-y-10">
          {/* Active Filters Skeleton Row */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="space-y-2 px-1">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-1/4 rounded-full" />
                    <Skeleton className="h-5 w-1/4 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-11 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
