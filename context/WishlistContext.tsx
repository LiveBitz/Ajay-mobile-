"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
  };
  createdAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  loadWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist from API
  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/wishlist");
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated
          setItems([]);
          return;
        }
        throw new Error("Failed to load wishlist");
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error loading wishlist:", err);
      setError(err instanceof Error ? err.message : "Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Check if product is in wishlist
  const isWishlisted = useCallback((productId: string) => {
    return items.some((item) => item.productId === productId);
  }, [items]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    try {
      setError(null);
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please login to add items to wishlist");
        }
        throw new Error("Failed to add to wishlist");
      }

      const data = await response.json();
      if (data.action === "added") {
        setItems((prev) => [data.data, ...prev]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add to wishlist";
      setError(errorMsg);
      console.error("Error adding to wishlist:", err);
      throw err;
    }
  }, []);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setError(null);
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      const data = await response.json();
      if (data.action === "removed") {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to remove from wishlist";
      setError(errorMsg);
      console.error("Error removing from wishlist:", err);
      throw err;
    }
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (isWishlisted(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [isWishlisted, addToWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isLoading,
        error,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
