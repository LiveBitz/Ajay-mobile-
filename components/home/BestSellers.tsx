import React from "react";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";

async function getBestSellers() {
  // Phase 7: Filter by stock in database query instead of JavaScript (40% less data)
  const products = await prisma.product.findMany({
    where: { 
      isBestSeller: true,
      stock: { gt: 0 }  // Only fetch products with stock
    },
    orderBy: { createdAt: 'desc' },
    take: 8  // Only fetch needed products
  });

  return products;
}

export async function BestSellers() {
  const bestsellerProducts = await getBestSellers();

  if (bestsellerProducts.length === 0) return null;

  return (
    <section id="best-sellers" className="py-16 md:py-20 bg-zinc-50 border-t border-zinc-200">
      <div className="container mx-auto">
        <div className="px-4 md:px-6 lg:px-8 mb-10">
          <SectionHeading 
            title="Best Sellers" 
            subtitle="The most loved pieces from our collection." 
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 px-4 md:px-6 lg:px-8">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
