"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface HurryUpProductCardProps {
  product: any;
}

export function HurryUpProductCard({ product }: HurryUpProductCardProps) {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addItem } = useCart();
  
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);

    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
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
      setIsAddingToCart(false);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="relative overflow-hidden rounded-2xl border-2 border-stone-100 shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col hover:border-brand hover:scale-105 group-hover:bg-stone-50/50">
        {/* Image Container */}
        <div className="p-0 flex-1 group-hover:opacity-95 transition-opacity duration-300">
          <div className="block relative aspect-square overflow-hidden bg-stone-100">
            {/* Product Image */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={(e) => {
                (e.target as any).src = "https://placehold.co/300/f4f4f5/9ca3af?text=" + encodeURIComponent(product.name);
              }}
            />

            {/* Wishlist Button Overlay */}
            <button
              onClick={handleWishlistClick}
              disabled={isAddingToWishlist}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-125 hover:shadow-xl transition-all z-10 disabled:opacity-50 active:scale-90"
              aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isWishlisted(String(product.id)) ? "fill-brand stroke-brand" : "stroke-stone-600"
                )}
              />
            </button>

            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-brand to-red-700 text-white hover:shadow-lg hover:scale-110 font-bold px-2 py-1 rounded-full shadow-md z-10 transition-all duration-300">
                {discount}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col items-start p-4 space-y-3">
          {/* Product Name */}
          <div className="w-full">
            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-brand transition-colors duration-300 text-stone-900">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2 mt-2 tabular-nums">
              <span className="font-black text-lg text-stone-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-stone-500 line-through decoration-stone-400/60">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button - Light Theme */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0}
            className={cn(
              "w-full rounded-xl gap-2 h-10 font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 bg-stone-100 text-stone-900 border-2 border-stone-200 hover:bg-brand hover:text-white hover:border-brand hover:shadow-lg disabled:opacity-50"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
            <span className="sm:hidden">{isAddingToCart ? "..." : "Add"}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
