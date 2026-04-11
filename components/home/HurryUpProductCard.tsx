"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HurryUpProductCardProps {
  product: any;
}

export function HurryUpProductCard({ product }: HurryUpProductCardProps) {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  
  const discount = product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddingToWishlist(true);

    try {
      await toggleWishlist(String(product.id));
      const wishlisted = isWishlisted(String(product.id));
      
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
    <Link
      href={`/product/${product.slug}`}
      className="group"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-zinc-100 aspect-square">
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1.5 rounded-md font-black text-xs md:text-sm flex items-center gap-1">
              <span>{discount}%</span>
              <span className="hidden sm:inline">off</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all active:scale-90 group-hover:scale-110 disabled:opacity-50"
            aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn(
              "w-5 h-5 transition-colors",
              isWishlisted(String(product.id)) ? "fill-brand stroke-brand" : "stroke-zinc-400 hover:stroke-red-500"
            )} />
          </button>

          {/* Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as any).src = "https://placehold.co/300/f4f4f5/9ca3af?text=" + encodeURIComponent(product.name);
            }}
          />
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-4 flex-1 flex flex-col gap-3">
          {/* Name */}
          <div className="flex-1">
            <p className="text-xs md:text-sm font-bold text-zinc-900 line-clamp-2 group-hover:text-brand transition-colors">
              {product.name}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-black text-zinc-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs md:text-sm text-zinc-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <QuickAddButton product={product} />
        </div>
      </div>
    </Link>
  );
}
