"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shirt, Watch, FlaskConical, Briefcase, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySelectionModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, {
  icon: any;
  description: string;
}> = {
  men: {
    icon: Shirt,
    description: "Apparel & premium wear",
  },
  accessories: {
    icon: Briefcase,
    description: "Bags & lifestyle essentials",
  },
  perfumes: {
    icon: FlaskConical,
    description: "Signature scents & fragrances",
  },
  watches: {
    icon: Watch,
    description: "Luxury timepieces & craft",
  },
};

// Fallback icon when category doesn't have a specific icon
const DEFAULT_ICON = Sparkles;

export function CategorySelectionModal({
  categories,
  isOpen,
  onClose,
}: CategorySelectionModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show all categories dynamically - no hardcoded filter
  const allCategoriesForDisplay = categories;

  const handleSelect = (categoryId: string) => {
    onClose();
    router.push(`/admin/products/new?catId=${categoryId}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card — Responsive */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0">
        <div className={cn(
          "w-full sm:w-full md:max-w-2xl pointer-events-auto",
          "bg-white",
          "rounded-2xl sm:rounded-3xl overflow-hidden",
          "shadow-2xl border border-zinc-100",
          "animate-in fade-in zoom-in-95 duration-300"
        )}>

          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-12 h-1 rounded-full bg-zinc-300" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-zinc-100/50">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Choose Collection
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 mt-1.5 leading-relaxed">
                Select a primary category for this new product
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-zinc-600" />
            </button>
          </div>

          {/* Grid */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {allCategoriesForDisplay.map((cat) => {
                const key = cat.name.toLowerCase();
                const config = CATEGORY_CONFIG[key];
                const Icon = config?.icon || DEFAULT_ICON;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={cn(
                      "group flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl text-center",
                      "border-2 border-zinc-100 bg-white/50 backdrop-blur-sm",
                      "hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md",
                      "active:scale-95 transition-all duration-200"
                    )}
                  >
                    {/* Icon box */}
                    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 group-hover:from-zinc-100 group-hover:to-zinc-200 flex items-center justify-center transition-all duration-200">
                      <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-zinc-700 group-hover:text-zinc-900" strokeWidth={1.5} />
                    </div>

                    {/* Text */}
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-zinc-900 leading-snug">
                        {cat.name}
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug">
                        {config?.description || "Manage & organize"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-zinc-50 to-zinc-100/50 border-t border-zinc-100/50 flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Digital Inventory Management
            </p>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Souled Standard
            </div>
          </div>

        </div>
      </div>
    </>
  );
}