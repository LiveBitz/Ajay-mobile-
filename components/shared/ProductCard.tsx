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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  const categoryName = typeof product.category === 'object' 
    ? product.category?.name 
    : product.category;

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
    <Card className="group relative overflow-hidden rounded-xl border-none shadow-none hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-0 flex-1">
        <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imgError ? "https://picsum.photos/seed/error/600/600" : product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
          {/* Wishlist Button Overlay */}
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors hover:bg-white z-10 disabled:opacity-50"
            aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                isWishlisted(String(product.id)) ? "fill-brand stroke-brand" : "stroke-zinc-600"
              )}
            />
          </button>
          
          {/* Category Badge */}
          <Badge className="absolute top-3 left-3 bg-white text-zinc-950 hover:bg-white font-medium px-3 py-1 rounded-full shadow-sm z-10">
            {categoryName}
          </Badge>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute bottom-3 left-3 bg-success text-white hover:bg-success font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              {product.discount}% OFF
            </Badge>
          )}
        </Link>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start p-4 space-y-3">
        <Link href={`/product/${product.slug}`} className="w-full">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 tabular-nums">
            <span className="font-bold text-lg text-zinc-900">₹{product.price}</span>
            <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
              ₹{product.originalPrice}
            </span>
          </div>
        </Link>
        
        <Link href={`/product/${product.slug}`} className="w-full">
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-zinc-200 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-300 gap-2 h-10 font-bold text-xs uppercase tracking-widest"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
