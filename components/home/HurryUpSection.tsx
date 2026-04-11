import React from "react";
import prisma from "@/lib/prisma";
import { HurryUpProductCard } from "./HurryUpProductCard";
import { HurryUpNavigation } from "./HurryUpNavigation";

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
    <section className="py-12 md:py-16 bg-gradient-to-r from-orange-100 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight mb-2">
              Limited Time Offers!
            </h2>
            <p className="text-lg md:text-xl font-bold text-zinc-700">
              Save Up to 40% on Premium Phones
            </p>
          </div>
          
          <HurryUpNavigation />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {products.map((product: any) => (
            <HurryUpProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
