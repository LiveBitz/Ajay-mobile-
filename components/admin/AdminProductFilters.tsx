"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AdminProductFiltersProps {
  categories: Category[];
  initialSearch?: string;
  initialCategoryId?: string;
}

export function AdminProductFilters({
  categories,
  initialSearch = "",
  initialCategoryId = "all",
}: AdminProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  // Sync state with URL when browsing (e.g. back button)
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const updateFilters = (newSearch: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newCategory && newCategory !== "all") {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }

    // Reset to page 1 when filtering
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    // Use a small delay or debouncing if needed, but for simplicity we'll use a form or manual trigger if it's too heavy.
    // Actually, debounced updates to the URL are better.
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialSearch) {
        updateFilters(search, initialCategoryId);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/[0.02] border border-zinc-100 p-2 rounded-[22px] backdrop-blur-sm">
      {/* Search Input */}
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-all duration-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search items by name or description..."
          className="w-full pl-11 pr-10 py-3 bg-white border border-zinc-200 rounded-[18px] text-sm font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 transition-all shadow-sm"
        />
        {search && (
          <button 
            onClick={() => handleSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-900 transition-colors bg-zinc-100 p-1 rounded-full"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
        <Select
          value={initialCategoryId}
          onValueChange={(val) => updateFilters(search, val)}
        >
          <SelectTrigger className="w-full md:w-[220px] h-[52px] rounded-[18px] border-zinc-200 bg-white font-black text-zinc-700 text-xs uppercase tracking-widest focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 shadow-sm px-5 transition-all">
            <div className="flex items-center gap-3">
              <Filter className="w-3.5 h-3.5 text-red-500" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            sideOffset={8}
            className="rounded-[20px] border-zinc-100 shadow-2xl bg-white/95 backdrop-blur-xl min-w-[220px] p-2"
          >
            <SelectItem value="all" className="font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl focus:bg-red-50 focus:text-red-600 mb-1">
              All Categories
            </SelectItem>
            <div className="h-px bg-zinc-100 my-1 mx-1" />
            {categories.map((category) => (
              <SelectItem 
                key={category.id} 
                value={category.id} 
                className="font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl focus:bg-red-50 focus:text-red-600 transition-all mb-0.5"
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPending && (
          <div className="flex items-center justify-center bg-white border border-zinc-100 shadow-sm w-[52px] h-[52px] rounded-[18px] shrink-0">
            <div className="w-5 h-5 border-[3px] border-red-100 border-t-red-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
