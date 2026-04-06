import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productsBySlug } from "@/lib/data";

interface CatalogHeaderProps {
  slug: string;
  count: number;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export function CatalogHeader({ slug, count, sortBy, setSortBy }: CatalogHeaderProps) {
  const categoryName = slug === "sale" 
    ? "Seasonal Sale" 
    : slug === "new-arrivals" 
      ? "New Arrivals" 
      : productsBySlug[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/category/${slug}`}>{categoryName}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tighter">
            {categoryName}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Showing {count} results
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Sort By:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] rounded-full bg-white border-zinc-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance" className="rounded-lg">Relevance</SelectItem>
              <SelectItem value="price-asc" className="rounded-lg">Price: Low to High</SelectItem>
              <SelectItem value="price-desc" className="rounded-lg">Price: High to Low</SelectItem>
              <SelectItem value="newest" className="rounded-lg">Newest First</SelectItem>
              <SelectItem value="discount" className="rounded-lg">Discount: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
