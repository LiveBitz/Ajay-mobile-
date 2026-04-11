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
  const categoryName = !slug 
    ? "All Phones" 
    : slug === "sale" 
      ? "Special Offers" 
      : slug === "new-arrivals" 
        ? "Latest Launches" 
        : productsBySlug[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-xs md:text-sm text-zinc-600 hover:text-zinc-900">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-zinc-300" />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/category/${slug}`} className="text-xs md:text-sm text-zinc-900 font-medium">{categoryName}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
            {categoryName}
          </h1>
          <p className="text-sm md:text-base text-zinc-600 font-medium">
            {count} product{count !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="hidden lg:flex items-center gap-4">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] rounded-lg bg-white border border-zinc-200 h-10 text-black">
              <SelectValue placeholder="Sort by" className="text-black" />
            </SelectTrigger>
            <SelectContent className="rounded-lg bg-black border-slate-800">
              <SelectItem value="relevance" className="bg-black text-white hover:bg-slate-900 focus:bg-slate-900">Relevance</SelectItem>
              <SelectItem value="price-asc" className="bg-black text-white hover:bg-slate-900 focus:bg-slate-900">Price: Low to High</SelectItem>
              <SelectItem value="price-desc" className="bg-black text-white hover:bg-slate-900 focus:bg-slate-900">Price: High to Low</SelectItem>
              <SelectItem value="newest" className="bg-black text-white hover:bg-slate-900 focus:bg-slate-900">Newest First</SelectItem>
              <SelectItem value="discount" className="bg-black text-white hover:bg-slate-900 focus:bg-slate-900">Best Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
