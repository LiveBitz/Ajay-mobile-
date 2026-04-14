import React from "react";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";
import { getTotalStock } from "@/lib/inventory";

async function getNewArrivals() {
  const products = await prisma.product.findMany({
    where: { 
      isNew: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20 // Fetch more to filter by stock
  });

  // Filter products with stock > 0 using shared utility
  return products
    .filter(p => getTotalStock(p.sizes) > 0)
    .slice(0, 8);
}

export async function NewArrivals() {
  const featuredProducts = await getNewArrivals();

  if (featuredProducts.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-8 md:py-12 lg:py-16 bg-white">

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 lg:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 mb-1.5 tracking-tight">
            Latest Launches
          </h2>
          <p className="text-sm md:text-base text-zinc-500 font-medium">
            Discover the newest smartphone releases with cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
