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
  getAvailableColorsForSize,
  parseColor
} from "@/lib/inventory";

interface ProductSelectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    sizes: string[];
    colors: string[];
    variantPricing?: Record<string, { price: number; originalPrice: number }> | null;
    originalPrice?: number;
  };
  onPriceChange?: (price: number, originalPrice: number) => void;
}

export function ProductSelection({ product, onPriceChange }: ProductSelectionProps) {
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
      return product.colors;
    }
    const colorsForSize = getAvailableColorsForSize(product.sizes, selectedSize);
    if (colorsForSize.length === 0) {
      return product.colors;
    }
    return colorsForSize;
  }, [selectedSize, product.sizes, product.colors]);

  const hasColors = availableColors.length > 0;

  // When a size is selected, look up variant price and notify parent
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSelectedColor(null);
    setShowError(false);
    if (onPriceChange && product.variantPricing) {
      const vp = product.variantPricing[size];
      if (vp) {
        onPriceChange(vp.price, vp.originalPrice);
      } else if (product.price && product.originalPrice) {
        // Fall back to base price if no specific variant price set
        onPriceChange(product.price, product.originalPrice ?? product.price);
      }
    }
  };

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
              "text-xs font-bold uppercase tracking-widest transition-colors",
              showError && !selectedSize ? "text-rose-500" : "text-zinc-400"
            )}>
              Select Storage
            </p>
            <button className="text-xs font-semibold text-zinc-400 underline underline-offset-4 hover:text-zinc-900 transition-colors uppercase tracking-widest">
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
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    "relative group rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden px-3 py-2",
                    !hasInventory
                      ? "bg-zinc-50 border-zinc-100 text-zinc-200 cursor-not-allowed"
                      : isSelected
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-zinc-200"
                      : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-200 active:scale-95"
                  )}
                >
                  <span className="text-sm font-bold tracking-tight z-10">
                    {size}
                  </span>
                  {/* Show variant price hint if pricing is set */}
                  {product.variantPricing?.[size] && (
                    <span className={cn(
                      "text-[9px] font-bold tracking-tight z-10 mt-0.5",
                      isSelected ? "text-zinc-300" : "text-brand"
                    )}>
                      ₹{product.variantPricing[size].price.toLocaleString("en-IN")}
                    </span>
                  )}
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
            "text-xs font-bold uppercase tracking-widest transition-colors",
            showError && !selectedColor ? "text-rose-500" : "text-zinc-400"
          )}>
            Select Color {selectedSize && `• Available for ${selectedSize}`}
          </p>
          <div className="flex flex-wrap gap-4">
            {availableColors.map((colorStr: string) => {
              const { name, hex } = parseColor(colorStr);
              
              // Contrast check for checkmark
              const isLight = (() => {
                if (!hex.startsWith("#")) {
                  return ["white", "silver", "starlight", "arctic", "cream", "beige"].some(w => name.toLowerCase().includes(w));
                }
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminance > 0.75;
              })();

              return (
                <button
                  key={colorStr}
                  onClick={() => {
                    setSelectedColor(colorStr);
                    setShowError(false);
                  }}
                  title={name}
                  className={cn(
                    "group relative w-11 h-11 rounded-full border-2 transition-all duration-300 active:scale-90",
                    selectedColor === colorStr 
                      ? "border-zinc-900 ring-4 ring-zinc-100" 
                      : "border-transparent ring-1 ring-zinc-200 hover:ring-zinc-400"
                  )}
                >
                  <span 
                    className="absolute inset-1 rounded-full shadow-inner border border-zinc-50"
                    style={{ backgroundColor: hex }}
                  />
                  {selectedColor === colorStr && (
                    <Check className={cn(
                      "absolute inset-0 m-auto w-4 h-4 z-10",
                      isLight ? "text-zinc-900" : "text-white"
                    )} />
                  )}
                  
                  {/* Color name tooltip on hover */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Call to Action ── */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm tracking-wide shadow-sm transition-all duration-200 active:scale-95 gap-2.5 group"
          >
            <ShoppingBag className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Add to Cart
          </Button>
          <Button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className={cn(
              "h-12 w-12 rounded-xl transition-all duration-200 active:scale-90 flex items-center justify-center p-0 shrink-0 border-2",
              isWishlisted(product.id)
                ? "border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-sm"
                : "border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-400 hover:text-zinc-600 shadow-sm"
            )}
          >
            <Heart className={cn(
              "w-5 h-5 transition-all duration-200",
              isWishlisted(product.id)
                ? "fill-red-600 stroke-red-600"
                : ""
            )} />
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full h-12 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-95"
          style={{ backgroundColor: "#dc2626" }}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
