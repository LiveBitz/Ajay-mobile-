"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string; // Composite ID: productId-size-color
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number, maxQuantity?: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const savedCart = localStorage.getItem("souled_cart");
  if (!savedCart) return [];

  try {
    const parsed = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.productId === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        (typeof item.originalPrice === "number" || item.originalPrice === undefined) &&
        typeof item.image === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );
  } catch (err) {
    console.error("Failed to parse cart", err);
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(loadStoredCart());
      setIsInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("souled_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = useCallback((newItem: Omit<CartItem, "id" | "quantity">) => {
    const compositeId = `${newItem.productId}-${newItem.size || ""}-${newItem.color || ""}`;
    
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === compositeId);
      if (existingItem) {
        return prev.map((item) =>
          item.id === compositeId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, id: compositeId, quantity: 1 }];
    });
    
    // Auto-open sidebar for immediate conversion feedback
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number, maxQuantity?: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const requestedQty = item.quantity + delta;
            const cappedQty =
              typeof maxQuantity === "number"
                ? Math.min(requestedQty, Math.max(0, maxQuantity))
                : requestedQty;
            const newQty = Math.max(0, cappedQty);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
