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
      
      const response = await fetch("/api/wishlist", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated - silently handle
          setItems([]);
          return;
        }
        // Log error but don't show to user for other non-critical errors
        if (response.status === 500) {
          console.warn("Wishlist service temporarily unavailable");
        }
        setItems([]);
        return;
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      // Silently handle network errors (e.g., offline, fetch failure)
      console.debug("Wishlist load error:", err instanceof Error ? err.message : "Unknown error");
      setItems([]);
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

  // Add to wishlist — optimistic update
  const addToWishlist = useCallback(async (productId: string) => {
    // Immediately reflect in UI
    const tempItem: WishlistItem = {
      id: `temp-${productId}`,
      userId: "",
      productId,
      product: { id: productId, name: "", slug: "", price: 0, originalPrice: 0, discount: 0, image: "" },
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [tempItem, ...prev]);

    try {
      setError(null);
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        // Revert optimistic update
        setItems((prev) => prev.filter((item) => item.id !== tempItem.id));
        if (response.status === 401) throw new Error("Please login to add items to wishlist");
        if (response.status === 404) throw new Error("Product not found");
        throw new Error("Failed to add to wishlist");
      }

      const data = await response.json();
      if (data.action === "added" && data.data) {
        // Replace temp item with real data from server
        setItems((prev) =>
          prev.map((item) => (item.id === tempItem.id ? { ...data.data, userId: item.userId } : item))
        );
      }
    } catch (err) {
      setItems((prev) => prev.filter((item) => item.id !== tempItem.id));
      const errorMsg = err instanceof Error ? err.message : "Failed to add to wishlist";
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Remove from wishlist — optimistic update
  const removeFromWishlist = useCallback(async (productId: string) => {
    // Capture item before removing so we can restore on failure
    let removedItem: WishlistItem | undefined;
    setItems((prev) => {
      removedItem = prev.find((item) => item.productId === productId);
      return prev.filter((item) => item.productId !== productId);
    });

    try {
      setError(null);
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        // Revert optimistic update
        if (removedItem) setItems((prev) => [removedItem!, ...prev]);
        if (response.status === 401) throw new Error("Please login to manage wishlist");
        throw new Error("Failed to remove from wishlist");
      }
    } catch (err) {
      if (removedItem) setItems((prev) => [removedItem!, ...prev]);
      const errorMsg = err instanceof Error ? err.message : "Failed to remove from wishlist";
      setError(errorMsg);
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
