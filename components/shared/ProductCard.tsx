"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Card className="group relative overflow-hidden rounded-xl border-none shadow-none hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                isWishlisted ? "fill-brand stroke-brand" : "stroke-zinc-600"
              )}
            />
          </button>
          
          {/* Category Badge */}
          <Badge className="absolute top-3 left-3 bg-white text-zinc-950 hover:bg-white font-medium px-3 py-1 rounded-full shadow-sm">
            {product.category}
          </Badge>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute bottom-3 left-3 bg-success text-white hover:bg-success font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.discount}% OFF
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start p-4 space-y-3">
        <div className="w-full">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg">₹{product.price}</span>
            <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
              ₹{product.originalPrice}
            </span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full rounded-full border-zinc-200 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-300 gap-2 h-10"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
