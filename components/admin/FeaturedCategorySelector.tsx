"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Plus, 
  Layers, 
  Check, 
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategories } from "@/lib/actions/category-actions";
import { toggleCategoryFeatured } from "@/lib/actions/featured-category-actions";
import { useToast } from "@/hooks/use-toast";

interface FeaturedCategorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  currentFeaturedIds: string[];
}

export function FeaturedCategorySelector({
  isOpen,
  onClose,
  onAdded,
  currentFeaturedIds
}: FeaturedCategorySelectorProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      // Filter: must not be already featured AND must be a top-level category (no parent)
      const eligible = data.filter((cat: any) => 
        !currentFeaturedIds.includes(cat.id) && !cat.parentId
      );
      setCategories(eligible);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (categoryId: string) => {
    setProcessingId(categoryId);
    const result = await toggleCategoryFeatured(categoryId);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Category added to featured list",
      });
      onAdded();
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setProcessingId(null);
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 leading-tight">Feature New Category</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Select a category to showcase on the home page</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-zinc-100">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-brand transition-colors" />
              <input 
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-zinc-50 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Finding categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center">
                  <Layers className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-zinc-500 font-bold text-sm">
                  {categories.length === 0 ? "No available categories" : "No matches found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleAdd(cat.id)}
                    disabled={processingId !== null}
                    className="group relative flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-100 bg-white hover:border-brand/30 hover:bg-brand/5 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-100 group-hover:scale-105 transition-transform duration-300">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 truncate">{cat.name}</p>
                      <p className="text-xs text-zinc-400 font-medium truncate uppercase tracking-widest mt-0.5">{cat.slug}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand group-hover:text-white transition-all">
                      {processingId === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-2">
              Select one to Feature
            </p>
            <Button 
               variant="outline"
               onClick={onClose}
               className="h-9 px-4 rounded-xl text-xs font-bold bg-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
