"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist();
  const router = useRouter();

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900"></div>
          <p className="mt-4 text-zinc-500 text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-0 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900">My Wishlist</h1>
            {items.length > 0 && (
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
                {items.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-zinc-50 rounded-full p-6 flex items-center justify-center mb-5">
              <Heart className="w-8 h-8 text-zinc-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-2">Your wishlist is empty</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs">
              Save your favourite items here to revisit them anytime.
            </p>
            <button
              onClick={() => router.push("/")}
              className="h-12 px-6 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: "#dc2626" }}
            >
              Browse Phones
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {items.map((wishlistItem) => (
              <div
                key={wishlistItem.id}
                className="group relative bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-zinc-50">
                  <Link href={`/product/${wishlistItem.product.slug}`}>
                    <Image
                      src={wishlistItem.product.image}
                      alt={wishlistItem.product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Discount Badge */}
                  {wishlistItem.product.discount > 0 && (
                    <span
                      className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold text-white z-10"
                      style={{ backgroundColor: "#dc2626" }}
                    >
                      {wishlistItem.product.discount}% OFF
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(wishlistItem.productId)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md z-10 transition-all"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="w-4 h-4 fill-current text-red-500" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <Link href={`/product/${wishlistItem.product.slug}`}>
                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">
                      {wishlistItem.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-zinc-900">
                      ₹{Math.round(wishlistItem.product.price)}
                    </span>
                    {wishlistItem.product.originalPrice > wishlistItem.product.price && (
                      <span className="text-xs text-zinc-400 line-through">
                        ₹{Math.round(wishlistItem.product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${wishlistItem.product.slug}`}
                    className="mt-auto w-full h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
