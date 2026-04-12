"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function StickyMobileSearch() {
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Track scroll position for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Sticky Mobile Search Bar - Mobile Only */}
      <form
        onSubmit={handleSearch}
        className={cn(
          "md:hidden fixed left-0 right-0 z-40 w-full transition-all duration-300 px-4 py-3",
          isSticky
            ? "top-0 bg-white/95 backdrop-blur-md border-b-2 border-stone-200/50 shadow-lg animate-fade-in-down"
            : "top-[-80px] bg-white/95 backdrop-blur-md border-b-2 border-stone-200/50"
        )}
      >
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border-2 border-stone-200 focus:border-brand focus:outline-none transition-all duration-300 bg-white focus:bg-stone-50/50 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-stone-400" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="p-2.5 rounded-lg bg-brand text-white hover:bg-red-700 transition-colors duration-300 hover:scale-110 active:scale-95"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Spacer for sticky bar when active */}
      {isSticky && <div className="md:hidden h-16" />}
    </>
  );
}
