"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist, isWishlisted } = useWishlist();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by checking if items loaded
    if (!isLoading && items.length === 0) {
      // Could be no items or not authenticated
      // We'll assume they're authenticated if no error
    }
  }, [isLoading, items]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding items to your wishlist to save them for later
            </p>
            <Button
              onClick={handleContinueShopping}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((wishlistItem) => (
              <Card
                key={wishlistItem.id}
                className="group relative overflow-hidden rounded-xl border-none shadow-none hover:shadow-xl transition-all duration-300 h-full flex flex-col"
              >
                <CardContent className="p-0 flex-1">
                  <Link
                    href={`/product/${wishlistItem.product.slug}`}
                    className="block relative aspect-square overflow-hidden bg-muted"
                  >
                    <Image
                      src={wishlistItem.product.image}
                      alt={wishlistItem.product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Discount Badge */}
                    {wishlistItem.product.discount > 0 && (
                      <Badge className="absolute bottom-3 left-3 bg-success text-white hover:bg-success font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                        {wishlistItem.product.discount}% OFF
                      </Badge>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(wishlistItem.productId);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors hover:bg-white z-10"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-5 h-5 fill-brand stroke-brand" />
                    </button>
                  </Link>
                </CardContent>

                <CardFooter className="flex flex-col items-start p-4 space-y-3">
                  <Link href={`/product/${wishlistItem.product.slug}`} className="w-full">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-brand transition-colors">
                      {wishlistItem.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg font-bold text-black">
                      ₹{Math.round(wishlistItem.product.price)}
                    </span>
                    {wishlistItem.product.originalPrice > wishlistItem.product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{Math.round(wishlistItem.product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    className="w-full bg-black text-white hover:bg-gray-800 rounded-lg font-semibold py-2 flex items-center justify-center gap-2"
                  >
                    <Link href={`/product/${wishlistItem.product.slug}`}>
                      <ShoppingBag className="w-4 h-4" />
                      View Product
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
