"use client";

import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFilter {
  id: string;
  label: string;
  active: boolean;
}

interface SearchFiltersProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: string[]) => void;
  placeholder?: string;
}

const TRENDING_SEARCHES = [
  "iPhone 15 Pro",
  "Samsung Galaxy S24",
  "Google Pixel 8",
  "OnePlus 12",
  "Xiaomi 14",
];

const FILTER_OPTIONS = [
  { id: "budget", label: "Budget Phones" },
  { id: "premium", label: "Premium" },
  { id: "mid-range", label: "Mid-Range" },
  { id: "new", label: "New Arrivals" },
  { id: "sale", label: "On Sale" },
];

export function SearchFilters({
  onSearch,
  onFilterChange,
  placeholder = "Search for phones...",
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>(
    FILTER_OPTIONS.map((f) => ({ ...f, active: false }))
  );
  const [showDropdown, setShowDropdown] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save recent searches to localStorage
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setShowDropdown(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    saveSearch(query);
    onSearch?.(query);
  };

  const handleFilterToggle = (filterId: string) => {
    const updated = activeFilters.map((f) =>
      f.id === filterId ? { ...f, active: !f.active } : f
    );
    setActiveFilters(updated);
    onFilterChange?.(updated.filter((f) => f.active).map((f) => f.id));
  };

  const clearFilters = () => {
    const updated = activeFilters.map((f) => ({ ...f, active: false }));
    setActiveFilters(updated);
    onFilterChange?.([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowDropdown(false);
  };

  const activeFilterCount = activeFilters.filter((f) => f.active).length;

  return (
    <div className="w-full space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(searchQuery);
              }
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 rounded-lg border-2 border-stone-200 focus:border-brand focus:outline-none transition-all duration-300 bg-white focus:bg-stone-50/50"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 p-1 hover:bg-stone-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-stone-400 hover:text-stone-600" />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-stone-200 rounded-lg shadow-xl z-50 animate-fade-in-up">
            {searchQuery.trim() ? (
              // Search Results placeholder
              <div className="p-4 text-center text-stone-500">
                <p className="text-sm">Press Enter to search for "{searchQuery}"</p>
              </div>
            ) : (
              <>
                {/* Trending Searches */}
                {recentSearches.length === 0 && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                      <TrendingUp className="h-4 w-4 text-brand" />
                      Trending Now
                    </div>
                    <div className="space-y-2">
                      {TRENDING_SEARCHES.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(search)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-stone-100 transition-colors duration-200 text-sm text-stone-700 group flex items-center justify-between"
                        >
                          <span>{search}</span>
                          <Search className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                        <Clock className="h-4 w-4 text-stone-600" />
                        Recent
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem("recentSearches");
                        }}
                        className="text-xs h-6"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(search)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-stone-100 transition-colors duration-200 text-sm text-stone-700 group flex items-center justify-between"
                        >
                          <span>{search}</span>
                          <Search className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Overlay to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900">Filters</h3>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-6 text-brand hover:bg-brand/5"
            >
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, idx) => (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
              style={{
                animationDelay: `${idx * 50}ms`,
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 animate-fade-in-up",
                "group hover:scale-105 active:scale-95",
                filter.active
                  ? "bg-gradient-to-r from-brand to-red-700 text-white shadow-lg hover:shadow-xl border-2 border-transparent"
                  : "bg-stone-100 text-stone-700 border-2 border-stone-200 hover:border-brand hover:bg-brand/5"
              )}
            >
              <span className="flex items-center gap-2">
                {filter.label}
                {filter.active && (
                  <span className="ml-1 h-4 w-4 rounded-full bg-white/30 flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
