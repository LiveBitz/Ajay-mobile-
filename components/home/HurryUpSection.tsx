import React from "react";
import prisma from "@/lib/prisma";
import { HurryUpCarousel } from "./HurryUpCarousel";

async function getBestSellerProducts() {
  const products = await prisma.product.findMany({
    where: {
      isBestSeller: true,
      stock: { gt: 0 },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  return products;
}

export async function HurryUpSection() {
  const products = await getBestSellerProducts();

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Horizontal Carousel with Header */}
        <HurryUpCarousel products={products} />
      </div>
    </section>
  );
}
