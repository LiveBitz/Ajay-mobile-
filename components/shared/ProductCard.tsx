"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { getTotalStock } from "@/lib/inventory";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    slug: string;
    category: any;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    stock?: number;
    sizes?: string[];
    isNew?: boolean;
    isBestSeller?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  // Calculate total stock using shared utility
  const totalStock = getTotalStock(product.sizes);
  const isOutOfStock = totalStock === 0;

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
    <Card className="group relative overflow-hidden rounded-2xl border-2 border-stone-100 shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col hover:border-brand">
      <CardContent className="p-0 flex-1">
        <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-stone-100">
          <Image
            src={imgError ? "https://picsum.photos/seed/error/600/600" : product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
            quality={85}
            loading="lazy"
          />
          {/* Wishlist Button Overlay */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all z-10 disabled:opacity-50"
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
          {product.discount > 0 && (
            <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-brand to-red-700 text-white hover:shadow-lg font-bold px-2 py-1 rounded-full shadow-md z-10">
              {product.discount}% OFF
            </Badge>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
              <span className="text-white font-bold text-sm">OUT OF STOCK</span>
            </div>
          )}
        </Link>
      </CardContent>

      <CardFooter className="flex flex-col items-start p-4 space-y-3">
        <Link href={`/product/${product.slug}`} className="w-full">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 tabular-nums">
            <span className="font-black text-lg text-stone-900">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-stone-500 line-through decoration-stone-400/60">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </Link>

        <Link href={`/product/${product.slug}`} className="w-full">
          <Button
            disabled={isOutOfStock}
            className={cn(
              "w-full rounded-xl border-2 border-stone-200 gap-2 h-10 font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 bg-white hover:bg-stone-50 text-stone-900 hover:border-stone-300",
              !isOutOfStock && "group-hover:bg-brand group-hover:text-white group-hover:border-brand",
              isOutOfStock && "opacity-50 cursor-not-allowed"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
