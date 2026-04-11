import React from "react";
import prisma from "@/lib/prisma";
import { BestSellersCarousel } from "@/components/home/BestSellersCarousel";

async function getBestSellers() {
  // Fetch bestseller products with stock > 0
  const products = await prisma.product.findMany({
    where: { 
      isBestSeller: true,
      stock: { gt: 0 }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      isNew: true,
      isBestSeller: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 12  // Fetch up to 12 bestsellers
  });

  return products;
}

export async function BestSellersSection() {
  const bestsellerProducts = await getBestSellers();

  if (bestsellerProducts.length === 0) return null;

  return (
    <BestSellersCarousel products={bestsellerProducts} />
  );
}
