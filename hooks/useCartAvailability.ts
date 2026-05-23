"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/context/CartContext";

export interface CartAvailability {
  id: string;
  productId: string;
  availableQuantity: number;
  inStock: boolean;
  canIncrement: boolean;
}

export function useCartAvailability(items: CartItem[]) {
  const [availability, setAvailability] = useState<Record<string, CartAvailability>>({});

  const signature = useMemo(
    () =>
      items
        .map((item) =>
          [item.id, item.productId, item.size ?? "", item.color ?? "", item.quantity].join("|")
        )
        .join("::"),
    [items]
  );

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/cart/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to check stock");
        return response.json();
      })
      .then((data) => {
        const nextAvailability = Array.isArray(data?.items)
          ? Object.fromEntries(
              data.items
                .filter((item: CartAvailability) => typeof item?.id === "string")
                .map((item: CartAvailability) => [item.id, item])
            )
          : {};
        setAvailability(nextAvailability);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to check cart stock", error);
      });

    return () => controller.abort();
  }, [signature, items]);

  return { availability, isCheckingStock: false };
}
