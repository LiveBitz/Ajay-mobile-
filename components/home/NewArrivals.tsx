import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getTotalStock } from "@/lib/inventory";
import { cn } from "@/lib/utils";

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
    <section id="new-arrivals" className="py-16 md:py-20 container mx-auto">
      <div className="px-4 md:px-6 lg:px-8 mb-10">
        <SectionHeading 
          title="Latest Launches" 
          subtitle="Check out the newest smartphone releases with cutting-edge technology."
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 px-4 md:px-6 lg:px-8">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </section>
  );
}
