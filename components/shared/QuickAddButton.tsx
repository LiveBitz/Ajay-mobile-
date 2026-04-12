"use client";

import React, { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface QuickAddButtonProps {
  product: any;
  className?: string;
}

export function QuickAddButton({ product, className = "" }: QuickAddButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      // Add product to cart with default options
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        // Could add default size/color selection here if needed
      });

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isLoading || product.stock <= 0}
      className={`w-full h-10 md:h-11 rounded-xl bg-white hover:bg-stone-50 active:bg-white text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs md:text-sm transition-all active:scale-95 gap-2 flex items-center justify-center shadow-md hover:shadow-lg border-2 border-stone-200 hover:border-stone-300 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" />
          <span className="hidden sm:inline">Adding...</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span className="hidden sm:inline">Add</span>
        </>
      )}
    </button>
  );
}
