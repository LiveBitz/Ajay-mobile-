"use client";

import React, { useState, useMemo } from "react";
import { ShoppingBag, Heart, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getTotalStock, 
  extractBaseSizes, 
  getAvailableColorsForSize 
} from "@/lib/inventory";

interface ProductSelectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    sizes: string[];
    colors: string[];
  };
}

export function ProductSelection({ product }: ProductSelectionProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Use shared utility for consistent extraction
  const cleanSizes = useMemo(() => extractBaseSizes(product.sizes), [product.sizes]);
  const hasSizes = cleanSizes.length > 0;
  
  // Get available colors: if size selected, filter by size; otherwise show all
  const availableColors = useMemo(() => {
    if (!selectedSize) {
      // No size selected: show all colors from product.colors
      return product.colors;
    }
    
    // Size selected: get colors for that specific size
    const colorsForSize = getAvailableColorsForSize(product.sizes, selectedSize);
    
    // If no colors found for this size (old format data), fall back to all colors
    if (colorsForSize.length === 0) {
      return product.colors;
    }
    
    return colorsForSize;
  }, [selectedSize, product.sizes, product.colors]);

  const hasColors = availableColors.length > 0;

  const handleAddToCart = () => {
    const isSizeMissing = hasSizes && !selectedSize;
    const isColorMissing = hasColors && !selectedColor;

    if (isSizeMissing || isColorMissing) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    
    setShowError(false);
  };

  const handleWishlistClick = async () => {
    setIsAddingToWishlist(true);

    try {
      await toggleWishlist(product.id);
      const wishlisted = isWishlisted(product.id);
      
      toast({
        title: wishlisted ? "Added to Wishlist" : "Removed from Wishlist",
        description: wishlisted 
          ? `${product.name} has been added to your wishlist` 
          : `${product.name} has been removed from your wishlist`,
        duration: 2000,
      });
    } catch (error: any) {
      const errorMsg = error.message || "Failed to update wishlist";
      if (errorMsg.includes("login")) {
        toast({
          title: "Login Required",
          description: "Please login to add items to your wishlist",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
          duration: 2000,
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ── Selection Validation Feedback ── */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight">
                {hasSizes && !selectedSize && hasColors && !selectedColor
                  ? "Please select Size and Color"
                  : hasSizes && !selectedSize
                  ? "Please select a Size"
                  : "Please select a Color"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sizes ── */}
      {hasSizes && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
              showError && !selectedSize ? "text-rose-500" : "text-zinc-400"
            )}>
              Select Storage
            </p>
            <button className="text-[10px] font-bold text-zinc-400 underline underline-offset-4 hover:text-zinc-900 transition-colors uppercase tracking-widest">
              Storage Guide
            </button>
          </div>

          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3">
            {cleanSizes.map((size: string) => {
              const isSelected = selectedSize === size;
              
              // Check if this size has any inventory
              const hasInventory = product.sizes.some((entry: string) => 
                entry.startsWith(size + "-")
              );

              return (
                <button
                  key={size}
                  disabled={!hasInventory}
                  onClick={() => {
                    setSelectedSize(size);
                    setSelectedColor(null); // Reset color when size changes
                    setShowError(false);
                  }}
                  className={cn(
                    "relative group h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden",
                    !hasInventory
                      ? "bg-zinc-50 border-zinc-100 text-zinc-200 cursor-not-allowed"
                      : isSelected
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-zinc-200"
                      : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-200 active:scale-95"
                  )}
                >
                  <span className="text-[13px] font-black tracking-tight z-10">
                    {size}
                  </span>
                  {!hasInventory && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="block w-[140%] h-0.5 bg-zinc-200/50 rotate-[35deg]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Colors ── */}
      {hasColors && (
        <div className="space-y-5">
          <p className={cn(
            "text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
            showError && !selectedColor ? "text-rose-500" : "text-zinc-400"
          )}>
            Visual Palette (Color) {selectedSize && `• Available for ${selectedSize}`}
          </p>
          <div className="flex flex-wrap gap-4">
            {availableColors.map((color: string) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setShowError(false);
                }}
                className={cn(
                  "group relative w-11 h-11 rounded-full border-2 transition-all duration-300 active:scale-90",
                  selectedColor === color 
                    ? "border-zinc-900 ring-4 ring-zinc-100" 
                    : "border-transparent ring-1 ring-zinc-200 hover:ring-zinc-400"
                )}
              >
                <span 
                  className="absolute inset-1 rounded-full shadow-inner"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                {selectedColor === color && (
                  <Check className={cn(
                    "absolute inset-0 m-auto w-4 h-4 z-10",
                    color.toLowerCase() === 'white' || color.toLowerCase() === '#ffffff' ? "text-zinc-900" : "text-white"
                  )} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Call to Action ── */}
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex gap-3">
          <Button 
            onClick={handleAddToCart}
            className="flex-1 h-16 rounded-[2rem] bg-zinc-950 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-zinc-200 transition-all duration-300 active:scale-95 gap-3 group"
          >
            <ShoppingBag className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Add to Collective
          </Button>
          <Button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className={cn(
              "h-16 w-16 rounded-full transition-all duration-300 active:scale-90 flex items-center justify-center p-0 shrink-0",
              isWishlisted(product.id)
                ? "border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 border"
                : "border-zinc-100 bg-white hover:border-zinc-200 hover:bg-zinc-50 hover:text-rose-400 border text-zinc-300"
            )}
          >
            <Heart className={cn(
              "w-5 h-5 transition-colors stroke-black",
              isWishlisted(product.id) && "fill-rose-500 stroke-rose-500"
            )} />
          </Button>
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full h-14 rounded-full bg-brand hover:bg-brand/90 text-white font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 active:scale-95"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
